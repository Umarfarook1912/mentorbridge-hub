import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ProfileForm } from '@/features/student/profile/profile-form'

export const metadata: Metadata = { title: 'My Profile' }

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account details and preferences" />
      <ProfileForm />
    </div>
  )
}
