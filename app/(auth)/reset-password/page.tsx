import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { verifyEmailTokenSchema } from "@/lib/validations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Reset Password | DevStash",
  description: "Create a new password for your DevStash account",
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const token = params.token

  // Validate token format
  const validated = verifyEmailTokenSchema.safeParse({ token })

  if (!validated.success) {
    return (
      <div className="w-full max-w-sm">
        <Card className="border-[#262626] bg-[#1a1a1a]">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#fafafa]">
              Invalid reset link
            </CardTitle>
            <CardDescription className="text-[#a3a3a3]">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/forgot-password"
              className="text-[#3b82f6] hover:text-[#2563eb] hover:underline text-center block"
            >
              Request a new reset link
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <ResetPasswordForm token={token!} />
    </div>
  )
}
