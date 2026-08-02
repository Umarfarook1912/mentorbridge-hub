import { DOMAIN_INTERESTS } from '@/lib/constants'

export type MeetingDomain = (typeof DOMAIN_INTERESTS)[number]

export interface MeetingAudience {
  targetDomains?: string[] | null
  targetStudentIds?: string[] | null
}

export interface MeetingAudienceStudent {
  id: string
  domainInterest?: string | null
}

/** Both empty = all students; else match domain OR explicit invite */
export function isMeetingForStudent(
  audience: MeetingAudience,
  student: MeetingAudienceStudent
): boolean {
  const domains = audience.targetDomains ?? []
  const ids = audience.targetStudentIds ?? []
  if (domains.length === 0 && ids.length === 0) return true
  if (ids.includes(student.id)) return true
  if (domains.length > 0 && student.domainInterest && domains.includes(student.domainInterest)) {
    return true
  }
  return false
}

export function formatMeetingAudience(
  targetDomains: string[] | null | undefined,
  targetStudentIds?: string[] | null
): string {
  const domains = targetDomains ?? []
  const people = targetStudentIds?.length ?? 0
  if (domains.length === 0 && people === 0) return 'All students'
  const parts: string[] = []
  if (domains.length) parts.push(domains.join(', '))
  if (people) parts.push(people === 1 ? '1 person' : `${people} people`)
  return parts.join(' + ')
}

export function toDbTargetDomains(domains: string[] | undefined): string[] | null {
  if (!domains || domains.length === 0) return null
  return domains
}

export function toDbTargetStudentIds(ids: string[] | undefined): string[] | null {
  if (!ids || ids.length === 0) return null
  return ids
}
