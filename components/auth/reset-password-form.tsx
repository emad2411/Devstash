"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordAction } from "@/actions/auth"
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
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Auto-redirect to login after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsPending(true)
    setServerError(null)

    const formData = new FormData()
    formData.append("token", token)
    formData.append("password", data.password)
    formData.append("confirmPassword", data.confirmPassword)

    const result = await resetPasswordAction(null, formData)

    if (result?.error) {
      setServerError(result.error)
      setIsPending(false)
    } else if (result?.success) {
      setIsSuccess(true)
      setIsPending(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-[#262626] bg-[#1a1a1a]">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#fafafa]">
            Password reset!
          </CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            Your password has been successfully reset. Redirecting to sign in...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-[#262626] bg-[#1a1a1a]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#fafafa]">
          Create new password
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-2 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-red-300">{serverError}</p>
              <Link
                href="/forgot-password"
                className="text-red-300/80 hover:text-red-300 underline"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="password" className="text-[#fafafa]">
              New Password
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

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
