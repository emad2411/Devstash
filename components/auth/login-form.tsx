"use client";

import { useActionState } from "react";
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
import { Label } from "@/components/ui/label";
import { Github } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

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
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#fafafa]">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
            />
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#fafafa]">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
            />
            {state?.errors?.password && (
              <p className="text-sm text-red-500">{state.errors.password[0]}</p>
            )}
          </div>
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
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
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full border-[#404040] bg-[#262626] text-[#fafafa] hover:bg-[#404040]"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
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
