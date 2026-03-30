import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot Password | DevStash",
  description: "Reset your DevStash password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <ForgotPasswordForm />
    </div>
  )
}
