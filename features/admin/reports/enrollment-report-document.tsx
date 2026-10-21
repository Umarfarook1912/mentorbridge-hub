import { AppLogo } from '@/components/shared/layout/app-logo'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants'
import { formatDate } from '@/utils/format'
import type { EnrollmentGroups } from '../dashboard/enrollment-groups'
import { countFromGroups } from './enrollment-report-query'
import {
  EnrollmentReportTable,
  activeColumns,
  companyColumns,
  inactiveColumns,
} from './enrollment-report-table'

interface EnrollmentReportDocumentProps {
  groups: EnrollmentGroups
  fromDate: string
  toDate: string
  generatedOn: string
  scopeLabel: string
}

export function EnrollmentReportDocument({
  groups,
  fromDate,
  toDate,
  generatedOn,
  scopeLabel,
}: EnrollmentReportDocumentProps) {
  const departments = countFromGroups(groups)
  const total = groups.active.length + groups.inactive.length + groups.company.length
  const period = `${formatDate(fromDate)} – ${formatDate(toDate)}`

  return (
    <article className="bg-background text-foreground mx-auto max-w-5xl px-6 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <AppLogo size="lg" priority />
          <p className="text-primary mt-3 text-xl font-bold">{APP_NAME}</p>
          <h1 className="text-lg font-semibold">Student Enrollment Report</h1>
          <p className="text-muted-foreground text-sm">{APP_DESCRIPTION}</p>
          <p className="mt-1 text-sm font-medium">{scopeLabel}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">Reporting period</p>
          <p>{period}</p>
          <p className="text-muted-foreground mt-2">Generated {formatDate(generatedOn)}</p>
        </div>
      </header>
      <div className="bg-primary mt-4 h-1.5 w-full" />
      <div className="bg-brand-secondary h-1 w-full" />

      <section className="mt-6 grid grid-cols-4 gap-3 text-center text-sm">
        <SummaryTile label="Total" value={total} />
        <SummaryTile label="Active" value={groups.active.length} />
        <SummaryTile label="Inactive" value={groups.inactive.length} />
        <SummaryTile label="Company" value={groups.company.length} />
      </section>

      <section className="mt-8">
        <h2 className="text-primary mb-2 text-base font-semibold">Department summary</h2>
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              {['Department', 'Active', 'Inactive', 'Company', 'Total'].map((header) => (
                <th key={header} className="px-2 py-1.5 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departments.map((row) => (
              <tr key={row.department} className="even:bg-muted border-border border-b">
                <td className="px-2 py-1.5">{row.department}</td>
                <td className="px-2 py-1.5">{row.active}</td>
                <td className="px-2 py-1.5">{row.inactive}</td>
                <td className="px-2 py-1.5">{row.company}</td>
                <td className="px-2 py-1.5 font-medium">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <EnrollmentReportTable
        title="Active students"
        count={groups.active.length}
        students={groups.active}
        columns={activeColumns}
      />
      <EnrollmentReportTable
        title="Inactive students"
        count={groups.inactive.length}
        students={groups.inactive}
        columns={inactiveColumns}
      />
      <EnrollmentReportTable
        title="Company students"
        count={groups.company.length}
        students={groups.company}
        columns={companyColumns}
      />

      <p className="text-muted-foreground mt-8 text-xs">
        {APP_NAME} enrollment report for submission. {scopeLabel}. Period {period}. Active includes
        students and executives in training. Inactive includes the date they left. Company includes
        name, role, location, and date of joining.
      </p>
    </article>
  )
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border rounded-lg border px-3 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-primary text-2xl font-bold">{value}</p>
    </div>
  )
}
