"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/actions/auth";
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
import { GithubIcon } from "@/components/icons/github";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { signInSchema, type SignInInput } from "@/lib/validations";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setIsPending(true);
    setServerError(null);
    setEmailNotVerified(false);
    setSubmittedEmail(data.email);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    // Note: loginAction redirects on success, which throws NEXT_REDIRECT
    // This is expected behavior - we only handle actual errors returned by the action
    const result = await loginAction(null, formData);

    if (result?.error) {
      setServerError(result.error);
      if (result.code === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
      }
      setIsPending(false);
    }
    // On success, the action redirects to /dashboard
  };

  return (
    <Card className="border-[#262626] bg-[#1a1a1a]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#fafafa]">
          Welcome back
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Sign in to your DevStash account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Field>
            <FieldLabel htmlFor="password" className="text-[#fafafa]">
              Password
            </FieldLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
                />
              )}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </Field>

          {serverError && (
            <div className="space-y-2">
              <p className="text-sm text-red-500">{serverError}</p>
              {emailNotVerified && submittedEmail && (
                <Link
                  href={`/verify-email?email=${encodeURIComponent(submittedEmail)}`}
                  className="text-sm text-[#3b82f6] hover:text-[#2563eb] hover:underline inline-block"
                >
                  Resend verification email
                </Link>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#404040]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1a1a1a] px-2 text-[#737373]">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setIsGitHubLoading(true);
            signIn("github", { callbackUrl: "/dashboard" });
          }}
          disabled={isGitHubLoading}
          className="w-full border-[#404040] bg-[#262626] text-[#fafafa] hover:bg-[#404040]"
        >
          {isGitHubLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <GithubIcon className="mr-2 h-4 w-4" />
              GitHub
            </>
          )}
        </Button>

        <p className="text-center text-sm text-[#a3a3a3]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#3b82f6] hover:text-[#2563eb] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
