"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations";
import { Loader2, CheckCircle } from "lucide-react";

interface ChangePasswordFormProps {
  hasPasswordAccount: boolean;
}

export function ChangePasswordForm({ hasPasswordAccount }: ChangePasswordFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsPending(true);
    setServerError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmNewPassword", data.confirmNewPassword);

    const result = await changePasswordAction(null, formData);

    if (result?.error) {
      setServerError(result.error);
      setIsPending(false);
    } else {
      setSuccess(true);
      reset();
      setIsPending(false);
    }
  };

  if (!hasPasswordAccount) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Your account was created using GitHub OAuth. Password change is not
          available for OAuth accounts.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
        <Controller
          name="currentPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
            />
          )}
        />
        <FieldError>{errors.currentPassword?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="newPassword"
              type="password"
              placeholder="••••••••"
              className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
            />
          )}
        />
        <FieldError>{errors.newPassword?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="confirmNewPassword">
          Confirm New Password
        </FieldLabel>
        <Controller
          name="confirmNewPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="confirmNewPassword"
              type="password"
              placeholder="••••••••"
              className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
            />
          )}
        />
        <FieldError>{errors.confirmNewPassword?.message}</FieldError>
      </Field>

      {serverError && (
        <p className="text-sm text-red-500">{serverError}</p>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle className="h-4 w-4" />
          Password changed successfully
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-[#3b82f6] hover:bg-[#2563eb]"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Changing...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  );
}