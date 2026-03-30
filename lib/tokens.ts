import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const TOKEN_EXPIRY_MS = 3600 * 1000 // 1 hour
const RESEND_COOLDOWN_MS = 60 * 1000 // 60 seconds
const RESET_PREFIX = "reset:"

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
