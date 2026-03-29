"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAction } from "@/actions/auth";
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
import { signUpSchema, type SignUpInput } from "@/lib/validations";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    setIsPending(true);
    setServerError(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    try {
      const result = await registerAction(null, formData);

      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success && result?.email) {
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-[#262626] bg-[#1a1a1a]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#fafafa]">
          Create an account
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Start organizing your developer knowledge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name" className="text-[#fafafa]">
              Name
            </FieldLabel>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
                />
              )}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

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

          <Field>
            <FieldLabel htmlFor="confirmPassword" className="text-[#fafafa]">
              Confirm Password
            </FieldLabel>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
                />
              )}
            />
            <FieldError>{errors.confirmPassword?.message}</FieldError>
          </Field>

          {serverError && (
            <p className="text-sm text-red-500">{serverError}</p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white"
          >
            {isPending ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
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
