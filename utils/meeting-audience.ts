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

/** General domain means the meeting/task is for every student. */
export function includesGeneralAudience(domains: string[] | null | undefined): boolean {
  return (domains ?? []).includes('General')
}

/** Both empty OR General = all students; else match domain OR explicit invite */
export function isMeetingForStudent(
  audience: MeetingAudience,
  student: MeetingAudienceStudent
): boolean {
  const domains = audience.targetDomains ?? []
  const ids = audience.targetStudentIds ?? []
  if (domains.length === 0 && ids.length === 0) return true
  if (includesGeneralAudience(domains)) return true
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
  if ((domains.length === 0 || includesGeneralAudience(domains)) && people === 0) {
    return includesGeneralAudience(domains) ? 'General (all students)' : 'All students'
  }
  const parts: string[] = []
  if (domains.length) {
    parts.push(
      includesGeneralAudience(domains)
        ? 'General (all students)'
        : domains.join(', ')
    )
  }
  if (people) parts.push(people === 1 ? '1 person' : `${people} people`)
  return parts.join(' + ')
}

export function toDbTargetDomains(domains: string[] | undefined): string[] | null {
  if (!domains || domains.length === 0) return null
  // General alone (or with other domains) still stores General for display/filtering
  return domains
}

export function toDbTargetStudentIds(ids: string[] | undefined): string[] | null {
  if (!ids || ids.length === 0) return null
  return ids
}

/** Aliases for shared meeting + task audience */
export const isAudienceForStudent = isMeetingForStudent
export const formatAudience = formatMeetingAudience
