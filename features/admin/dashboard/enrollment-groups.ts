import { getEnrollmentStatus, type EnrollmentStatus } from '@/lib/enrollment'
import type { IStudentEntity } from '@/services/students'

export type EnrollmentGroups = Record<EnrollmentStatus, IStudentEntity[]>

export function trainingStudents(students: IStudentEntity[]) {
  return students.filter((student) => student.role === 'Student')
}

/** Active enrollment includes executives who are still in training. */
export function activeWithExecutives(students: IStudentEntity[], groups: EnrollmentGroups) {
  const executives = students
    .filter((student) => student.role === 'Executive' && getEnrollmentStatus(student) === 'active')
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
  const seen = new Set(groups.active.map((student) => student.id))
  const active = [...groups.active]
  for (const executive of executives) {
    if (!seen.has(executive.id)) active.push(executive)
  }
  active.sort((a, b) => a.full_name.localeCompare(b.full_name))
  return { ...groups, active }
}

export function groupStudents(students: IStudentEntity[]): EnrollmentGroups {
  const groups: EnrollmentGroups = { active: [], inactive: [], company: [] }
  for (const student of students) {
    groups[getEnrollmentStatus(student)].push(student)
  }
  for (const status of Object.keys(groups) as EnrollmentStatus[]) {
    groups[status].sort((a, b) => a.full_name.localeCompare(b.full_name))
  }
  return groups
}

export function earliestEnrollmentDate(students: IStudentEntity[]) {
  const dates = students.map((s) => s.created_at.slice(0, 10)).filter(Boolean).sort()
  return dates[0] ?? ''
}
