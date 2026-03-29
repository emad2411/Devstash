import { Suspense } from "react";
import { VerifyEmailHandler } from "@/components/auth/verify-email-handler";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  console.log("[page] Token from URL:", params.token ? `${params.token.slice(0, 20)}... (${params.token.length} chars)` : "none");
  const hasToken = !!params.token;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f0f]">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-64 bg-[#1a1a1a] rounded-lg border border-[#262626] animate-pulse" />
        }
      >
        {params.token ? <VerifyEmailHandler token={params.token} /> : <ResendVerificationForm />}
      </Suspense>
    </div>
  );
}
