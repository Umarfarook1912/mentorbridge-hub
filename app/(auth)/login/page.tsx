import type { Metadata } from 'next'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <FeatureCard className="w-full max-w-sm" contentClassName="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your MentorBridge account</p>
      </div>
      <LoginForm />
    </FeatureCard>
  )
}
