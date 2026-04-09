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

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type VerifyEmailTokenInput = z.infer<typeof verifyEmailTokenSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })

export const deleteAccountSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>

// Item creation schema
export const createItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  itemTypeId: z.string().min(1, "Item type is required"),
  content: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  language: z.string().optional(),
  tags: z.string().optional(),
})

export type CreateItemInput = z.infer<typeof createItemSchema>

// Item update schema (same as create but with required id)
export const updateItemSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  itemTypeId: z.string().min(1, "Item type is required"),
  content: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  language: z.string().optional(),
  tags: z.string().optional(),
})

export type UpdateItemInput = z.infer<typeof updateItemSchema>
