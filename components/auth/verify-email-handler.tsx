"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface VerifyEmailHandlerProps {
  token: string;
}

export function VerifyEmailHandler({ token }: VerifyEmailHandlerProps) {
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          // Redirect to success page after a short delay
          setTimeout(() => {
            router.push("/verify-email/success");
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Verification failed");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    }

    verifyEmail();
  }, [token, router]);

  if (status === "loading") {
    return (
      <Card className="border-[#262626] bg-[#1a1a1a] w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#fafafa]">
            Verifying your email
          </CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="border-[#262626] bg-[#1a1a1a] w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#fafafa] flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Email verified!
          </CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            Redirecting you to the success page...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-[#262626] bg-[#1a1a1a] w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#fafafa] flex items-center justify-center gap-2">
          <XCircle className="h-6 w-6 text-red-500" />
          Verification failed
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button
          onClick={() => router.push("/login")}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
        >
          Back to login
        </Button>
      </CardContent>
    </Card>
  );
}
