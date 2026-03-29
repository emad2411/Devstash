"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { signInSchema, signUpSchema } from "@/lib/validations"
import { generateVerificationToken, canResendToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function loginAction(prevState: unknown, formData: FormData) {
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
        return { error: "Please verify your email before signing in", code: "EMAIL_NOT_VERIFIED" }
      }
      return { error: "Invalid email or password" }
    }
    throw error
  }

  redirect("/dashboard")
}

export async function registerAction(prevState: unknown, formData: FormData) {
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

export async function logoutAction() {
  await signOut({ redirect: false })
  redirect("/")
}
