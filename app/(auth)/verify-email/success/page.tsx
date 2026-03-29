import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f0f]">
      <Card className="border-[#262626] bg-[#1a1a1a] w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#fafafa]">
            Email verified!
          </CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            Your email has been successfully verified. You can now sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Link href="/login">
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              Continue to login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
