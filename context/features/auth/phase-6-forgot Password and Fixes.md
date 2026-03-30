# Phase 6: Forgot Password & Fixes

Three changes: fix the email sender for production (no custom domain yet), auto-resend verification emails on login with expired tokens, and implement a complete forgot/reset password flow.

---

## User Review Required

> [!IMPORTANT]
> **No database migration needed.** Password reset tokens will reuse the existing `VerificationToken` model by prefixing the `identifier` field with `reset:` (e.g., `reset:user@example.com` vs `user@example.com`). This cleanly separates the two token types without schema changes.

> [!WARNING]
> **Resend onboarding limit.** The `onboarding@resend.dev` sender only delivers to the **account owner's email** (the email tied to the Resend account). This is fine for testing but means other users won't receive emails in production until a custom domain is added.

---

## Part A — Fix: Email Sender for Production

### Problem
`lib/email.ts` currently uses `noreply@devstash.io` in production, but no custom domain is verified on Resend yet. Emails fail silently in the Vercel deployment.

### Solution

#### [MODIFY] [email.ts](file:///c:/Users/ramam/Desktop/devstash/lib/email.ts)

Replace the hardcoded environment check with an `EMAIL_FROM` environment variable, falling back to the Resend onboarding address:

```ts
// Before
const FROM_ADDRESS =
  process.env.NODE_ENV === "production"
    ? "DevStash <noreply@devstash.io>"
    : "DevStash <onboarding@resend.dev>"

// After
const FROM_ADDRESS =
  process.env.EMAIL_FROM || "DevStash <onboarding@resend.dev>"
```

This way:
- **Now**: Uses `onboarding@resend.dev` everywhere (works in both dev and production)
- **Later**: When a domain is verified, set `EMAIL_FROM=DevStash <noreply@devstash.io>` in Vercel env vars — zero code changes

---

## Part B — Fix: Auto-Resend Verification on Login

### Problem
When a user tries to log in with an unverified email (or an expired verification token), they see "Please verify your email" with a manual "Resend verification email" link. This requires two extra clicks and navigating to a different page.

### Solution
Auto-resend the verification email on the `EMAIL_NOT_VERIFIED` login error, and show a prominent banner directly in the login form.

#### [MODIFY] [auth.ts (actions)](file:///c:/Users/ramam/Desktop/devstash/actions/auth.ts)

In `loginAction`, when the `EMAIL_NOT_VERIFIED` error is caught:

```ts
if (error.message === "EMAIL_NOT_VERIFIED") {
  // Auto-resend verification email (respect cooldown)
  const allowed = await canResendToken(email)
  let emailSent = false

  if (allowed) {
    const token = await generateVerificationToken(email)
    await sendVerificationEmail(email, token)
    emailSent = true
  }

  return {
    error: emailSent
      ? "Your email is not verified. We've sent a new verification link — check your inbox."
      : "Your email is not verified. A verification email was recently sent — please check your inbox.",
    code: "EMAIL_NOT_VERIFIED",
    emailSent,
  }
}
```

#### [MODIFY] [login-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/login-form.tsx)

Replace the current `EMAIL_NOT_VERIFIED` error block with a styled info banner:

```tsx
{emailNotVerified && (
  <div className="flex items-center gap-2 text-sm bg-blue-500/10 border border-blue-500/20 p-3 rounded-md">
    <Mail className="h-4 w-4 text-blue-400 shrink-0" />
    <span className="text-blue-300">{serverError}</span>
  </div>
)}
```

- Replace the red error text + "Resend" link with a **blue info banner** with a mail icon
- The message already indicates whether a new email was sent or if they should check existing one
- Remove the manual "Resend verification email" `Link` — no longer needed since it's automatic

Also add a **"Forgot password?"** link (see Part C below).

---

## Part C — Feature: Forgot/Reset Password Flow

### Architecture

```
User Flow:
  Login page → "Forgot password?" link
  → /forgot-password → enter email → server action sends reset email
  → Email link → /reset-password?token=xxx → enter new password → server action resets password
  → Redirect to /login with success message
```

**Token strategy**: Reuse `VerificationToken` model with `identifier = "reset:{email}"` to differentiate from email verification tokens (`identifier = "{email}"`).

**Security**:
- Same CSPRNG + SHA-256 hashing as email verification
- Same 1-hour expiry
- Same 60-second resend cooldown
- Token consumed (deleted) after successful use
- Generic "If an account exists, we sent an email" response (no user enumeration)
- Only credential-based users can reset passwords (OAuth users don't have passwords)

---

### New Files

#### [NEW] [forgot-password-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/forgot-password-form.tsx)

Client component with RHF + Zod validation:
- Single `email` field with `forgotPasswordSchema` validation
- On submit → call `forgotPasswordAction` server action
- On success → show "Check your inbox" banner with mail icon + 60s countdown before allowing resend
- Link back to login page
- Same dark styling as other auth forms

#### [NEW] [reset-password-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/reset-password-form.tsx)

Client component with RHF + Zod validation:
- Two fields: `password` and `confirmPassword` using `resetPasswordSchema`
- Receives validated `token` as prop from parent page
- On submit → call `resetPasswordAction` server action with token + new password
- On success → show success message + redirect to `/login` after 2s
- On error (invalid/expired token) → show error with link to `/forgot-password`
- Same dark styling as other auth forms

#### [NEW] [forgot-password/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/(auth)/forgot-password/page.tsx)

Server component, renders `<ForgotPasswordForm />`.

#### [NEW] [reset-password/page.tsx](file:///c:/Users/ramam/Desktop/devstash/app/(auth)/reset-password/page.tsx)

Server component:
- Extract `token` from `searchParams`
- Validate token format with `verifyEmailTokenSchema` (same hex format rules)
- If invalid → render error card with link to `/forgot-password`
- If valid → render `<ResetPasswordForm token={token} />`

---

### Modified Files

#### [MODIFY] [validations.ts](file:///c:/Users/ramam/Desktop/devstash/lib/validations.ts)

Add two new schemas:

```ts
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
```

---

#### [MODIFY] [tokens.ts](file:///c:/Users/ramam/Desktop/devstash/lib/tokens.ts)

Add password reset token functions that reuse the same crypto strategy but with the `reset:` prefix:

```ts
const RESET_PREFIX = "reset:"

/** Generate a password reset token. Stored with identifier "reset:{email}". */
export async function generatePasswordResetToken(email: string): Promise<string> {
  const rawToken = crypto.randomBytes(48).toString("hex")
  const hashedToken = hashToken(rawToken)
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS)

  // Delete any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: `${RESET_PREFIX}${email}` },
  })

  await prisma.verificationToken.create({
    data: {
      identifier: `${RESET_PREFIX}${email}`,
      token: hashedToken,
      expires,
    },
  })

  return rawToken
}

/** Verify a password reset token. Returns the email if valid, null otherwise. */
export async function verifyPasswordResetToken(rawToken: string): Promise<string | null> {
  const hashedToken = hashToken(rawToken)

  return prisma.$transaction(async (tx) => {
    const record = await tx.verificationToken.findUnique({
      where: { token: hashedToken },
    })

    if (!record || record.expires < new Date()) return null

    // Must be a reset token (prefixed with "reset:")
    if (!record.identifier.startsWith(RESET_PREFIX)) return null

    const email = record.identifier.slice(RESET_PREFIX.length)

    // Consume the token
    await tx.verificationToken.delete({
      where: { token: hashedToken },
    })

    return email
  })
}

/** Check if a password reset email can be resent (60s cooldown). */
export async function canResendResetToken(email: string): Promise<boolean> {
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier: `${RESET_PREFIX}${email}` },
  })

  if (!existing) return true

  const createdAt = new Date(existing.expires.getTime() - TOKEN_EXPIRY_MS)
  const cooldownEnd = new Date(createdAt.getTime() + RESEND_COOLDOWN_MS)

  return new Date() >= cooldownEnd
}
```

Also clean up the `console.log` debug statements from the existing functions while we're here.

---

#### [MODIFY] [email.ts](file:///c:/Users/ramam/Desktop/devstash/lib/email.ts)

Add `sendPasswordResetEmail` function:

```ts
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Reset your DevStash password",
      html: `<!-- same styled template as verification email, with reset messaging -->`,
      text: `Reset your DevStash password.\n\nClick this link to reset: ${resetUrl}\n\nThis link expires in 1 hour.`,
    })

    if (error) {
      console.error("[email] Resend API error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err)
    return { success: false, error: "Failed to send email" }
  }
}
```

---

#### [MODIFY] [auth.ts (actions)](file:///c:/Users/ramam/Desktop/devstash/actions/auth.ts)

Add two new server actions:

```ts
/** Forgot password — sends a reset email (generic response to prevent enumeration). */
export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  const validated = forgotPasswordSchema.safeParse({ email: formData.get("email") })
  if (!validated.success) return { error: "Please enter a valid email" }

  const { email } = validated.data
  const genericResponse = { success: true, message: "If an account exists, we sent a reset link" }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    })

    // Only allow reset for credential users (who have a password)
    if (!user || !user.password) return genericResponse

    const allowed = await canResendResetToken(email)
    if (!allowed) return { error: "Please wait before requesting another email." }

    const token = await generatePasswordResetToken(email)
    await sendPasswordResetEmail(email, token)

    return genericResponse
  } catch {
    return genericResponse
  }
}

/** Reset password — verifies token and updates the password. */
export async function resetPasswordAction(prevState: unknown, formData: FormData) {
  const token = formData.get("token") as string
  const validated = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validated.success) {
    return { error: "Invalid form data", errors: validated.error.flatten().fieldErrors }
  }

  if (!token) return { error: "Missing reset token" }

  const email = await verifyPasswordResetToken(token)
  if (!email) return { error: "Token is invalid or has expired" }

  const hashedPassword = await bcrypt.hash(validated.data.password, 10)
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  return { success: true }
}
```

Also modify `loginAction` as described in Part B.

---

#### [MODIFY] [login-form.tsx](file:///c:/Users/ramam/Desktop/devstash/components/auth/login-form.tsx)

Two changes:
1. Replace `EMAIL_NOT_VERIFIED` error with blue info banner (Part B)
2. Add "Forgot password?" link between the password field and the submit button:

```tsx
<div className="flex justify-end">
  <Link
    href="/forgot-password"
    className="text-sm text-[#a3a3a3] hover:text-[#3b82f6] hover:underline"
  >
    Forgot password?
  </Link>
</div>
```

---

## Summary of All Changes

| Action | File | Purpose |
|--------|------|---------|
| Modify | `lib/email.ts` | Use `EMAIL_FROM` env var, add `sendPasswordResetEmail` |
| Modify | `lib/tokens.ts` | Add `generatePasswordResetToken`, `verifyPasswordResetToken`, `canResendResetToken`, clean logs |
| Modify | `lib/validations.ts` | Add `forgotPasswordSchema`, `resetPasswordSchema` + types |
| Modify | `actions/auth.ts` | Auto-resend in `loginAction`, add `forgotPasswordAction`, `resetPasswordAction` |
| Modify | `components/auth/login-form.tsx` | Blue verification banner, "Forgot password?" link |
| **New** | `components/auth/forgot-password-form.tsx` | Forgot password form (RHF + Zod) |
| **New** | `components/auth/reset-password-form.tsx` | Reset password form (RHF + Zod) |
| **New** | `app/(auth)/forgot-password/page.tsx` | Forgot password page |
| **New** | `app/(auth)/reset-password/page.tsx` | Reset password page (token validation) |

---

## Open Questions

> [!IMPORTANT]
> **OAuth users**: If a GitHub OAuth user clicks "Forgot password?", they don't have a password to reset. The current plan returns the generic "If an account exists, we sent a reset link" response (no enumeration). Should we also detect OAuth-only users at the login form level and hide the "Forgot password?" link, or is the generic response sufficient?

> [!IMPORTANT]
> **Vercel env var**: You'll need to add `EMAIL_FROM` to your Vercel environment variables once you have a domain. Until then, leave it unset and the fallback `onboarding@resend.dev` will be used. No action needed now.

---

## Verification Plan

### Automated Tests
- `npm run build` — Ensure no TypeScript errors
- `npm run lint` — Ensure ESLint passes

### Manual Verification (Browser)
1. **Email sender fix**: Register a new user → check Resend dashboard → email should be sent from `onboarding@resend.dev` in both dev and production
2. **Auto-resend on login**: Register → don't verify → try to log in → see blue banner "We've sent a new verification email" → check inbox → verify → log in succeeds
3. **Login cooldown**: Try to log in twice within 60s without verifying → second attempt says "recently sent, check your inbox"
4. **Forgot password flow**: Go to login → click "Forgot password?" → enter email → see "check inbox" → click reset link from email → enter new password → redirect to login → log in with new password
5. **Invalid/expired reset token**: Navigate to `/reset-password?token=invalid` → see error card
6. **OAuth user reset**: Enter GitHub-only user's email on forgot password → generic response (no error, no email sent)
