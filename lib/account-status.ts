/** Students marked inactive cannot use the app. */
export function isInactiveStudent(profile: {
  role?: string | null
  is_active?: boolean | null
} | null): boolean {
  if (!profile) return false
  return profile.role === 'Student' && profile.is_active === false
}

export const ACCOUNT_INACTIVE_MESSAGE =
  'Your account is inactive. Please contact your administrator for help.'
