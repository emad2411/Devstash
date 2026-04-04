import { verifyToken } from "@/lib/tokens"
import { verifyEmailTokenSchema } from "@/lib/validations"
import { rateLimiters, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // --- Rate limit check ---
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "unknown"
  const rl = await checkRateLimit(rateLimiters.verifyEmail, ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: formatRetryAfter(rl.reset) },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
        },
      }
    )
  }

  try {
    const body = await request.json()

    // Validate token format using Zod
    const validationResult = verifyEmailTokenSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid verification token format" },
        { status: 400 }
      )
    }

    const { token } = validationResult.data
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
