import type { Metadata } from 'next'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const metadata: Metadata = { title: 'Set New Password' }

export default function ResetPasswordPage() {
  return (
    <FeatureCard className="w-full max-w-sm" contentClassName="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Set new password</h1>
        <p className="text-muted-foreground text-sm">
          Choose a strong password for your MentorBridge account.
        </p>
      </div>
      <ResetPasswordForm />
    </FeatureCard>
  )
}
