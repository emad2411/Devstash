import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "DevStash <onboarding@resend.dev>"

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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f;">
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
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f;">
          <h1 style="color: #fafafa; font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
          <p style="color: #a3a3a3; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Click the link below to reset your DevStash password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Reset Password
          </a>
          <p style="color: #737373; font-size: 14px; margin-top: 24px;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
        </div>
      `,
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
