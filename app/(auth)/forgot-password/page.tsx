import type { Metadata } from 'next'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ForgotPasswordPage() {
  return (
    <FeatureCard className="w-full max-w-sm" contentClassName="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Forgot password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </FeatureCard>
  )
}
