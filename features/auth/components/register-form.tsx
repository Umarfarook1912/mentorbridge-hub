'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { ROUTES } from '@/lib/constants'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterInput) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}${ROUTES.authCallback}`,
      },
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
        <div className="text-4xl">📬</div>
        <p className="font-medium">Check your email</p>
        <p className="text-muted-foreground text-sm">
          We sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Link href={ROUTES.login} className="text-primary block text-sm hover:underline">
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="Prasanna Kumar" {...register('fullName')} />
        {errors.fullName && <p className="text-destructive text-sm">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repeat password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link href={ROUTES.login} className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
