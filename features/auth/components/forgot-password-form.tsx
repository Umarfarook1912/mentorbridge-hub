'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { ROUTES } from '@/lib/constants'

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordInput) {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="space-y-3 text-center">
        <div className="text-4xl">✉️</div>
        <p className="font-medium">Email sent</p>
        <p className="text-muted-foreground text-sm">Check your inbox for a password reset link.</p>
        <Link href={ROUTES.login} className="text-primary block text-sm hover:underline">
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Reset Link
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Remembered it?{' '}
        <Link href={ROUTES.login} className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
