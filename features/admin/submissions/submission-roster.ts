import { isRosterStudent } from '@/lib/enrollment'
import { isAudienceForStudent } from '@/utils/meeting-audience'

interface RosterStudent {
  id: string
  full_name: string
  email: string
  department: string | null
  domain_interest: string | null
  avatar_url: string | null
  is_active?: boolean | null
  company_name?: string | null
}

interface Audience {
  targetDomains?: string[] | null
  targetStudentIds?: string[] | null
}

export function listUnsubmittedStudents(
  students: RosterStudent[],
  submittedIds: Set<string>,
  audience: Audience,
  filters: { department: string; domain: string; search: string }
) {
  const query = filters.search.trim().toLowerCase()
  return students
    .filter((s) => isRosterStudent(s))
    .filter((s) =>
      isAudienceForStudent(audience, { id: s.id, domainInterest: s.domain_interest })
    )
    .filter((s) => !submittedIds.has(s.id))
    .filter((s) => !filters.department || s.department === filters.department)
    .filter((s) => !filters.domain || s.domain_interest === filters.domain)
    .filter((s) => {
      if (!query) return true
      return s.full_name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query)
    })
    .map((s) => ({
      id: s.id,
      full_name: s.full_name,
      email: s.email,
      department: s.department,
      domain_interest: s.domain_interest,
      avatar_url: s.avatar_url,
    }))
}

export function filterRosterSubmissions<T extends { profiles: unknown }>(rows: T[], search: string) {
  const rosterOnly = rows.filter((row) =>
    isRosterStudent(row.profiles as { is_active?: boolean | null; company_name?: string | null } | null)
  )
  const query = search.trim().toLowerCase()
  if (!query) return rosterOnly
  return rosterOnly.filter((row) => {
    const profile = row.profiles as { full_name?: string; email?: string } | null
    const name = profile?.full_name?.toLowerCase() ?? ''
    const email = profile?.email?.toLowerCase() ?? ''
    return name.includes(query) || email.includes(query)
  })
}
