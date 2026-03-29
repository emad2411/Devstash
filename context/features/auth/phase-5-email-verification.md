# Phase 5: Email Verification (Secure Implementation)

## Status

Not Started

## Goals

- Implement email verification after credential-based registration using Resend API
- Block login for unverified users (credentials provider)
- Auto-verify GitHub OAuth users (GitHub already verifies emails)
- Verification tokens expire after 1 hour and are securely hashed at rest (SHA-256)
- Provide resend verification email functionality with a 60-second rate limit
- Prevent user/email enumeration at all endpoints

## Architecture

```text
REGISTRATION (Credentials)
  → Validate input (Zod)
  → Transaction:
      → Create user (emailVerified = null)
      → Generate CSPRNG token (48 bytes, hex)
      → Store SHA-256(token) + expires + identifier in VerificationToken
      → Send raw token via Resend email
  → Return generic "Check your inbox" (no auto sign-in)

VERIFY (POST /api/verify-email)
  → Receive { token } in request body (NOT query string)
  → Compute SHA-256(token)
  → Atomic transaction:
      → Find VerificationToken by hashed token
      → Validate expiry
      → Set user.emailVerified = now()
      → Delete token
  → Return success / redirect to success page

LOGIN (Credentials)
  → authorize() checks user.emailVerified
  → If null → return specific error code "EMAIL_NOT_VERIFIED"
  → loginAction surfaces "Please verify your email" message

LOGIN (GitHub OAuth)
  → signIn callback in auth.ts (Node runtime, NOT auth.config.ts)
  → If emailVerified is null → set to now()

RESEND
  → Server action receives email
  → Check cooldown (VerificationToken.expires - 59 min > now = too soon)
  → Always return generic "If an account exists, we sent an email"
  → Only actually send if user exists + unverified + cooldown passed
```

## Implementation Steps

### Step 1: Install Resend

```bash
npm install resend
```

Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
# Optional, fallback is NEXTAUTH_URL
APP_URL=http://localhost:3000
```

### Step 2: Create `lib/tokens.ts`

Secure token generation and verification utilities.

```typescript
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const TOKEN_EXPIRY_MS = 3600 * 1000 // 1 hour
const RESEND_COOLDOWN_MS = 60 * 1000 // 60 seconds

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function generateVerificationToken(email: string): Promise<string> {
  const rawToken = crypto.randomBytes(48).toString("hex")
  const hashedToken = hashToken(rawToken)
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS)

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires,
    },
  })

  return rawToken
}

export async function verifyToken(rawToken: string): Promise<string | null> {
  const hashedToken = hashToken(rawToken)

  return prisma.$transaction(async (tx) => {
    const record = await tx.verificationToken.findUnique({
      where: { token: hashedToken },
    })

    if (!record || record.expires < new Date()) {
      return null
    }

    await tx.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    })

    await tx.verificationToken.delete({
      where: { token: hashedToken },
    })

    return record.identifier
  })
}

export async function canResendToken(email: string): Promise<boolean> {
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  })

  if (!existing) return true

  const createdAt = new Date(existing.expires.getTime() - TOKEN_EXPIRY_MS)
  const cooldownEnd = new Date(createdAt.getTime() + RESEND_COOLDOWN_MS)

  return new Date() >= cooldownEnd
}
```

### Step 3: Create `lib/email.ts`

Resend client with error handling and plain-text fallback.

```typescript
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS =
  process.env.NODE_ENV === "production"
    ? "DevStash <noreply@devstash.io>" // Replace with your verified domain
    : "DevStash <onboarding@resend.dev>"

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
  const verificationUrl = `${appUrl}/verify-email?token=${token}`

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Verify your DevStash email",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #fafafa; font-size: 24px; margin-bottom: 16px;">Verify your email</h1>
          <p style="color: #a3a3a3; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Click the link below to verify your email address. This link expires in 1 hour.
          </p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Verify Email
          </a>
          <p style="color: #737373; font-size: 14px; margin-top: 24px;">
            If you didn't create a DevStash account, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `Verify your DevStash email.\n\nClick this link to verify: ${verificationUrl}\n\nThis link expires in 1 hour.`,
    })

    if (error) {
      console.error("[email] Resend API error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[email] Failed to send verification email:", err)
    return { success: false, error: "Failed to send email" }
  }
}
```

### Step 4: Create API Route `app/api/verify-email/route.ts`

POST-based verification handler.

```typescript
import { verifyToken } from "@/lib/tokens"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    const email = await verifyToken(token)

    if (!email) {
      return NextResponse.json(
        { error: "Token is invalid or has expired" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[verify-email] Error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
```

### Step 5: Modify `auth.ts`

Update `authorize()` to block unverified users and add a `signIn` callback to auto-verify GitHub users.

```typescript
// Add emailVerified to getUser select

// In the Credentials authorize callback, after passwordsMatch check:
if (!user.emailVerified) {
  throw new Error("EMAIL_NOT_VERIFIED")
}

// Add signIn callback in NextAuth config (Node runtime — Prisma safe):
callbacks: {
  ...authConfig.callbacks,
  async signIn({ user, account }) {
    // Auto-verify GitHub OAuth users
    if (account?.provider === "github" && user.email) {
      await prisma.user.updateMany({
        where: { email: user.email, emailVerified: null },
        data: { emailVerified: new Date() },
      })
    }
    return true
  },
},
```

### Step 6: Modify `actions/auth.ts`

Update `registerAction` to not sign in automatically, use a transaction, and generate/send the token.
Update `loginAction` to catch the specific error.
Add `resendVerificationAction`.

```typescript
// registerAction changes:
// - Remove signIn() call after user creation
// - Add: const token = await generateVerificationToken(email)
// - Add: await sendVerificationEmail(email, token)
// - Return { success: true, email: email } instead of redirect

// loginAction changes:
// - Catch "EMAIL_NOT_VERIFIED" error specifically
// - Return { error: "Please verify your email before signing in", code: "EMAIL_NOT_VERIFIED" }

// New action:
export async function resendVerificationAction(
  prevState: unknown,
  formData: FormData
) {
  const email = formData.get("email") as string
  if (!email) return { error: "Email is required" }

  const genericResponse = { success: true, message: "If an account exists, we sent a verification email" }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    })

    if (!user || user.emailVerified) return genericResponse

    const allowed = await canResendToken(email)
    if (!allowed) {
      return { error: "Please wait before requesting another email." }
    }

    const token = await generateVerificationToken(email)
    await sendVerificationEmail(email, token)

    return genericResponse
  } catch {
    return genericResponse 
  }
}
```

### Step 7: Create UI Components and Pages

#### `components/auth/register-form.tsx`
Handle `{ success: true }` state — on success, redirect to `/verify-email?email=xxx`.

#### `app/(auth)/verify-email/page.tsx`
Dual-purpose page:
- **Without `?token=`**: "Check your inbox" message + resend button (uses email from search params or a manual input)
- **With `?token=`**: Client component auto-POSTs the token to `/api/verify-email`, shows result

#### `app/(auth)/verify-email/success/page.tsx`
Simple confirmation page with "Continue to login" link.

#### `components/auth/verify-email-handler.tsx`
Client component that POSTs to `/api/verify-email` on mount.

#### `components/auth/resend-verification-form.tsx`
"Check your inbox" UI with a resend button using `resendVerificationAction`.

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `lib/tokens.ts` | CSPRNG token gen, SHA-256 hashing, cooldown |
| Create | `lib/email.ts` | Resend client |
| Create | `app/api/verify-email/route.ts` | POST endpoint for verification |
| Create | `app/(auth)/verify-email/page.tsx` | Verification entry point |
| Create | `app/(auth)/verify-email/success/page.tsx` | Success landing page |
| Create | `components/auth/verify-email-handler.tsx` | Client-side POSTer |
| Create | `components/auth/resend-verification-form.tsx`| Resend UI |
| Modify | `auth.ts` | Add verification blocks and auto-verify |
| Modify | `actions/auth.ts` | Update registration/login and add resend |
| Modify | `components/auth/register-form.tsx` | Post-registration UI flow |
| Install | `resend` package | SDK |
