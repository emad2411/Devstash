import { verifyToken } from "@/lib/tokens"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    console.log("[verify-email] Received token:", token ? `${token.slice(0, 10)}...` : "null")

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    const email = await verifyToken(token)

    console.log("[verify-email] Verification result:", email ? `Success for ${email}` : "Failed - token not found or expired")

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
