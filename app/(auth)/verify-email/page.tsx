import { Suspense } from "react";
import { VerifyEmailHandler } from "@/components/auth/verify-email-handler";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { verifyEmailTokenSchema } from "@/lib/validations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const hasToken = !!params.token;

  // Server-side token validation
  let tokenError: string | null = null;
  let validatedToken: string | null = null;

  if (hasToken) {
    const result = verifyEmailTokenSchema.safeParse({ token: params.token });
    if (!result.success) {
      tokenError = "Invalid verification token format. Please request a new verification email.";
    } else {
      validatedToken = result.data.token;
    }
  }

  // Show error card if token validation failed
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f0f]">
        <Card className="border-[#262626] bg-[#1a1a1a] w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#fafafa]">
              Invalid Token
            </CardTitle>
            <CardDescription className="text-[#a3a3a3]">
              {tokenError}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg h-8 px-2.5 text-sm font-medium bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f0f]">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-64 bg-[#1a1a1a] rounded-lg border border-[#262626] animate-pulse" />
        }
      >
        {validatedToken ? (
          <VerifyEmailHandler token={validatedToken} />
        ) : (
          <ResendVerificationForm />
        )}
      </Suspense>
    </div>
  );
}
