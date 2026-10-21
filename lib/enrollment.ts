export type EnrollmentStatus = 'active' | 'inactive' | 'company'

export interface EnrollmentFields {
  is_active?: boolean | null
  company_name?: string | null
}

export function getEnrollmentStatus(
  profile: EnrollmentFields | null | undefined
): EnrollmentStatus {
  if (!profile || profile.is_active === false) return 'inactive'
  if (profile.company_name?.trim()) return 'company'
  return 'active'
}

/** Active trainees only. Inactive and company students stay off attendance and submission lists. */
export function isRosterStudent(profile: EnrollmentFields | null | undefined): boolean {
  if (!profile) return true
  return getEnrollmentStatus(profile) === 'active'
}

export function enrollmentBadge(
  profile: EnrollmentFields | null | undefined
): 'Active' | 'Inactive' | 'Company' {
  const status = getEnrollmentStatus(profile)
  if (status === 'company') return 'Company'
  if (status === 'inactive') return 'Inactive'
  return 'Active'
}
