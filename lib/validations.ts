import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
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

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>

export const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const verifyEmailTokenSchema = z.object({
  token: z
    .string()
    .length(96, "Invalid verification token")
    .regex(/^[a-f0-9]+$/, "Invalid verification token format"),
})

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type VerifyEmailTokenInput = z.infer<typeof verifyEmailTokenSchema>
