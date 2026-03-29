"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resendVerificationAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { resendVerificationSchema, type ResendVerificationInput } from "@/lib/validations";

export function ResendVerificationForm() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");
  const [countdown, setCountdown] = useState(0);
  const [serverSuccess, setServerSuccess] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: urlEmail || "",
    },
  });

  // Update form value when urlEmail changes
  useEffect(() => {
    if (urlEmail) {
      setValue("email", urlEmail);
    }
  }, [urlEmail, setValue]);

  // Handle countdown for resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: ResendVerificationInput) => {
    setIsPending(true);
    setServerSuccess(false);
    setServerError("");

    const formData = new FormData();
    formData.append("email", data.email);

    try {
      const result = await resendVerificationAction(null, formData);

      if (result && "success" in result && result.success) {
        setServerSuccess(true);
        setServerMessage(result.message || "Verification email sent!");
        setCountdown(60);
      } else if (result && "error" in result && result.error) {
        setServerError(result.error);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const showManualEmailInput = !urlEmail;

  return (
    <Card className="border-[#262626] bg-[#1a1a1a] w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#262626] flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-[#3b82f6]" />
        </div>
        <CardTitle className="text-2xl font-bold text-[#fafafa]">
          Check your inbox
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          {urlEmail ? (
            <>
              We&apos;ve sent a verification link to{" "}
              <span className="text-[#fafafa] font-medium">{urlEmail}</span>.
              Click the link to verify your email.
            </>
          ) : (
            "Enter your email and we'll send you a verification link."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {serverSuccess && (
          <div className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 p-3 rounded-md">
            <CheckCircle className="h-4 w-4" />
            <span>{serverMessage}</span>
          </div>
        )}

        {serverError && (
          <p className="text-sm text-red-500">{serverError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {showManualEmailInput && (
            <Field>
              <FieldLabel htmlFor="email" className="text-[#fafafa]">
                Email
              </FieldLabel>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
                  />
                )}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>
          )}

          {!showManualEmailInput && (
            <input type="hidden" {...control.register("email")} value={urlEmail} />
          )}

          <Button
            type="submit"
            disabled={isPending || countdown > 0}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend verification email"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-[#737373]">
          Already verified?{" "}
          <Link
            href="/login"
            className="text-[#3b82f6] hover:text-[#2563eb] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
