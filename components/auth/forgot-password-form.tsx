"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [isResending, setIsResending] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsPending(true)
    setServerError(null)

    const formData = new FormData()
    formData.append("email", data.email)

    const result = await forgotPasswordAction(null, formData)

    if (result && "error" in result && result.error) {
      setServerError(result.error)
      setIsPending(false)
    } else if (result && "success" in result && result.success) {
      setIsSuccess(true)
      startCountdown()
      setIsPending(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return

    setIsResending(true)
    const formData = new FormData()
    const email = control._formValues.email
    formData.append("email", email)

    const result = await forgotPasswordAction(null, formData)

    if (result && "error" in result && result.error) {
      setServerError(result.error)
    } else if (result && "success" in result && result.success) {
      setServerError(null)
      startCountdown()
    }
    setIsResending(false)
  }

  return (
    <Card className="border-[#262626] bg-[#1a1a1a]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#fafafa]">
          Reset your password
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSuccess ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-md">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-emerald-300 text-sm">
                  If an account exists, we sent a reset link to{" "}
                  <strong>{control._formValues.email}</strong>
                </p>
                <p className="text-emerald-300/70 text-xs">
                  Check your inbox and spam folder. The link expires in 1 hour.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                variant="outline"
                className="flex-1 border-[#404040] bg-[#262626] text-[#fafafa] hover:bg-[#404040]"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend email
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
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

            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-1 text-sm text-[#a3a3a3] hover:text-[#3b82f6] hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  )
}
