/**
 * Shared audience matching for the attendance report script.
 * Mirrors utils/meeting-audience.ts (General = everyone).
 */

export function isMeetingForStudent(meeting, student) {
  const domains = meeting.target_domains ?? []
  const ids = meeting.target_student_ids ?? []
  if (domains.length === 0 && ids.length === 0) return true
  if (domains.includes('General')) return true
  if (ids.includes(student.id)) return true
  if (domains.length > 0 && student.domain_interest && domains.includes(student.domain_interest)) {
    return true
  }
  return false
}
