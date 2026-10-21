import { formatDate } from '@/utils/format'
import type { IStudentEntity } from '@/services/students'

export interface ReportColumn {
  header: string
  value: (student: IStudentEntity) => string
}

function text(value: string | null | undefined) {
  return value?.trim() || '—'
}

export const baseColumns: ReportColumn[] = [
  { header: 'Student Name', value: (s) => s.full_name },
  { header: 'Department', value: (s) => text(s.department) },
  { header: 'Domain', value: (s) => text(s.domain_interest) },
  { header: 'Category', value: (s) => text(s.student_category) },
  { header: 'Email', value: (s) => s.email },
  { header: 'Phone', value: (s) => text(s.phone) },
]

export const inactiveColumns: ReportColumn[] = [
  ...baseColumns,
  { header: 'Inactive Date', value: (s) => (s.inactive_at ? formatDate(s.inactive_at) : '—') },
]

export const companyColumns: ReportColumn[] = [
  ...baseColumns,
  { header: 'Company', value: (s) => text(s.company_name) },
  { header: 'Role', value: (s) => text(s.company_role) },
  { header: 'Location', value: (s) => text(s.company_location) },
  {
    header: 'Date of Joining',
    value: (s) => (s.company_joined_at ? formatDate(s.company_joined_at) : '—'),
  },
]

export const activeColumns: ReportColumn[] = [
  { header: 'Student Name', value: (s) => s.full_name },
  { header: 'Role', value: (s) => (s.role === 'Executive' ? 'Executive' : 'Student') },
  ...baseColumns.slice(1),
  { header: 'Enrolled', value: (s) => formatDate(s.created_at) },
]

interface EnrollmentReportTableProps {
  title: string
  count: number
  students: IStudentEntity[]
  columns: ReportColumn[]
}

export function EnrollmentReportTable({
  title,
  count,
  students,
  columns,
}: EnrollmentReportTableProps) {
  return (
    <section className="mt-8">
      <h2 className="text-primary mb-2 text-base font-semibold">
        {title} <span className="text-muted-foreground font-medium">({count})</span>
      </h2>
      {!students.length ? (
        <p className="text-muted-foreground text-sm">No students in this group.</p>
      ) : (
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-2 py-1.5 font-medium">S.No</th>
              {columns.map((column) => (
                <th key={column.header} className="px-2 py-1.5 font-medium">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className="even:bg-muted border-border border-b">
                <td className="px-2 py-1.5">{index + 1}</td>
                {columns.map((column) => (
                  <td key={column.header} className="px-2 py-1.5">
                    {column.value(student)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
