"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export function ResendVerificationForm() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");
  const [email, setEmail] = useState(urlEmail || "");
  const [countdown, setCountdown] = useState(0);

  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    null
  );

  // Handle countdown for resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Start countdown after successful resend
  useEffect(() => {
    if (state && "success" in state && state.success) {
      setCountdown(60);
    }
  }, [state]);

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
        {state && "success" in state && state.success && (
          <div className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 p-3 rounded-md">
            <CheckCircle className="h-4 w-4" />
            <span>{state.message}</span>
          </div>
        )}

        {state && "error" in state && state.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <form action={formAction} className="space-y-4">
          {showManualEmailInput && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#fafafa]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="border-[#404040] bg-[#262626] text-[#fafafa] placeholder:text-[#737373]"
              />
            </div>
          )}

          {!showManualEmailInput && (
            <input type="hidden" name="email" value={email} />
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
