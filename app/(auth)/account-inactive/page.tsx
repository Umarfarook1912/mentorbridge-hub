import type { Metadata } from 'next'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { AccountInactiveView } from '@/features/auth/components/account-inactive-view'

export const metadata: Metadata = { title: 'Account Inactive' }

export default function AccountInactivePage() {
  return (
    <FeatureCard className="w-full max-w-sm" contentClassName="space-y-4">
      <AccountInactiveView />
    </FeatureCard>
  )
}
