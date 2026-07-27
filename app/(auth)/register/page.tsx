import type { Metadata } from 'next'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = { title: 'Create Account' }

export default function RegisterPage() {
  return (
    <FeatureCard className="w-full max-w-sm" contentClassName="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-muted-foreground text-sm">Join MentorBridge to start your journey</p>
      </div>
      <RegisterForm />
    </FeatureCard>
  )
}
