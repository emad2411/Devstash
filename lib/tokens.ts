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

  console.log("[tokens] Generating token for:", email)
  console.log("[tokens] Raw token (first 20 chars):", rawToken.slice(0, 20) + "...")
  console.log("[tokens] Hashed token (first 20 chars):", hashedToken.slice(0, 20) + "...")
  console.log("[tokens] Expires:", expires)

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  const created = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires,
    },
  })

  console.log("[tokens] Token created in DB:", created)

  return rawToken
}

export async function verifyToken(rawToken: string): Promise<string | null> {
  const hashedToken = hashToken(rawToken)

  console.log("[tokens] Verifying token (first 20 chars):", rawToken.slice(0, 20) + "...")
  console.log("[tokens] Computed hash (first 20 chars):", hashedToken.slice(0, 20) + "...")

  return prisma.$transaction(async (tx) => {
    const record = await tx.verificationToken.findUnique({
      where: { token: hashedToken },
    })

    console.log("[tokens] DB record found:", record ? "Yes" : "No")
    if (record) {
      console.log("[tokens] Record expires:", record.expires)
      console.log("[tokens] Now:", new Date())
      console.log("[tokens] Expired?:", record.expires < new Date())
    }

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
