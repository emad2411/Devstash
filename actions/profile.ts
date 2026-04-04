"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult<T = undefined> = {
  success?: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

/** Get current user profile data */
export async function getProfileAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
      createdAt: true,
      password: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  if (!user) {
    return { error: "User not found" };
  }

  return {
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isPro: user.isPro,
      createdAt: user.createdAt,
      hasPasswordAccount: !!user.password,
      oauthProviders: user.accounts.map((a) => a.provider),
    },
  };
}

/** Update user profile (name) */
export async function updateProfileAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ name: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = updateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name } = validatedFields.data;

  if (!name) {
    return { error: "Name is required" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/profile");
  return { success: true, data: { name } };
}

/** Change password for email users */
export async function changePasswordAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, email: true },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (!user.password) {
    return { error: "This account uses OAuth. Password change is not available." };
  }

  // Verify current password
  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    return { error: "Current password is incorrect" };
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}

/** Delete user account */
export async function deleteAccountAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const validatedFields = deleteAccountSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  // Verify email matches session user
  if (email !== session.user.email) {
    return { error: "Email does not match your account" };
  }

  // Delete user (cascade deletes handled by Prisma schema)
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  // Sign out the user and redirect to home
  await signOut({ redirect: false });
  redirect("/");
}