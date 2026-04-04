"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { signInSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations"
import { generateVerificationToken, canResendToken, generatePasswordResetToken, verifyPasswordResetToken, canResendResetToken } from "@/lib/tokens"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"
import { rateLimiters, checkRateLimit, formatRetryAfter, getClientIp } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function loginAction(prevState: unknown, formData: FormData) {
  // --- Rate limit check (before any validation or DB call) ---
  const ip = await getClientIp()
  const emailInput = (formData.get("email") as string) || "unknown"
  const rl = await checkRateLimit(rateLimiters.login, `${ip}:${emailInput}`)
  if (!rl.success) {
    return { error: formatRetryAfter(rl.reset) }
  }

  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid credentials",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      // Check for specific error message from authorize callback
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
      return { error: "Invalid email or password" }
    }
    throw error
  }

  redirect("/dashboard")
}

export async function registerAction(prevState: unknown, formData: FormData) {
  // --- Rate limit check (before any validation or DB call) ---
  const ip = await getClientIp()
  const rl = await checkRateLimit(rateLimiters.register, ip)
  if (!rl.success) {
    return { error: formatRetryAfter(rl.reset) }
  }

  const validatedFields = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "An account with this email already exists" }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user (emailVerified will be null by default)
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // Generate and send verification token
  const token = await generateVerificationToken(email)
  await sendVerificationEmail(email, token)

  // Return success with email for redirect to verification page
  return { success: true, email }
}

export async function resendVerificationAction(
  prevState: unknown,
  formData: FormData
) {
  // --- Rate limit check (before any validation or DB call) ---
  const ip = await getClientIp()
  const email = (formData.get("email") as string) || "unknown"
  const rl = await checkRateLimit(rateLimiters.resendVerification, `${ip}:${email}`)
  if (!rl.success) {
    return { error: formatRetryAfter(rl.reset) }
  }

  if (!email || email === "unknown") return { error: "Email is required" }

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

/** Forgot password — sends a reset email (generic response to prevent enumeration). */
export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  // --- Rate limit check (before any validation or DB call) ---
  const ip = await getClientIp()
  const rl = await checkRateLimit(rateLimiters.forgotPassword, ip)
  if (!rl.success) {
    return { error: formatRetryAfter(rl.reset) }
  }

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
  // --- Rate limit check (before any validation or DB call) ---
  const ip = await getClientIp()
  const rl = await checkRateLimit(rateLimiters.resetPassword, ip)
  if (!rl.success) {
    return { error: formatRetryAfter(rl.reset) }
  }

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

export async function logoutAction() {
  await signOut({ redirect: false })
  redirect("/")
}
