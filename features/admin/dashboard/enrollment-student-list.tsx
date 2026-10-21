import { formatDate } from '@/utils/format'
import type { EnrollmentStatus } from '@/lib/enrollment'
import type { IStudentEntity } from '@/services/students'

interface EnrollmentStudentListProps {
  students: IStudentEntity[]
  status: EnrollmentStatus
}

function detailLine(student: IStudentEntity, status: EnrollmentStatus) {
  if (status === 'inactive' && student.inactive_at) return formatDate(student.inactive_at)
  if (status !== 'company') return null
  return [student.company_name, student.company_role, student.company_location]
    .filter(Boolean)
    .join(' · ')
}

export function EnrollmentStudentList({ students, status }: EnrollmentStudentListProps) {
  if (!students.length) {
    return <p className="text-muted-foreground text-sm">No students in this group</p>
  }

  return (
    <ul className="max-h-72 space-y-0 overflow-y-auto">
      {students.map((student) => {
        const detail = detailLine(student, status)
        return (
          <li key={student.id} className="border-border border-b py-2 last:border-0">
            <p className="text-sm font-medium">{student.full_name}</p>
            <p className="text-muted-foreground text-xs">
              {student.department || '—'} · {student.domain_interest || '—'}
              {student.role === 'Executive' ? ' · Executive' : ''}
            </p>
            {detail ? <p className="text-muted-foreground text-xs">{detail}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
