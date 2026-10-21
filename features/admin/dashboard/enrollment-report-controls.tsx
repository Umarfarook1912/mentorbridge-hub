'use client'

import { useEffect, useState } from 'react'
import { FileDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DEPARTMENTS, DOMAIN_INTERESTS } from '@/lib/constants'
import { localToday } from '@/utils/meeting-time'
import type { IStudentEntity } from '@/services/students'
import { earliestEnrollmentDate } from './enrollment-groups'
import {
  reportSearch,
  type EnrollmentReportQuery,
  type ReportScope,
} from '../reports/enrollment-report-query'

const SCOPE_LABEL: Record<ReportScope, string> = {
  all: 'All students',
  ssm: 'SSM',
  'non-ssm': 'Non SSM',
  domain: 'Domain',
  department: 'Department',
}

interface EnrollmentReportControlsProps {
  students: IStudentEntity[]
  disabled?: boolean
}

export function EnrollmentReportControls({ students, disabled }: EnrollmentReportControlsProps) {
  const today = localToday()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState(today)
  const [scope, setScope] = useState<ReportScope>('all')
  const [domain, setDomain] = useState<string>(DOMAIN_INTERESTS[0])
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0])

  useEffect(() => {
    if (fromDate || !students.length) return
    setFromDate(earliestEnrollmentDate(students))
  }, [fromDate, students])

  function exportPdf() {
    const query: EnrollmentReportQuery = {
      from: fromDate || earliestEnrollmentDate(students) || today,
      to: toDate || today,
      scope,
      domain,
      department,
    }
    window.open(
      `/print/enrollment-report?${reportSearch(query)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className="border-border bg-muted/30 space-y-3 rounded-xl border p-3">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DateField label="Report from" value={fromDate} max={toDate || today} onChange={setFromDate} />
        <DateField label="To" value={toDate} min={fromDate} max={today} onChange={setToDate} />
        <label className="space-y-1">
          <span className="text-muted-foreground text-xs font-medium">PDF includes</span>
          <Select value={scope} onValueChange={(value) => setScope((value as ReportScope) ?? 'all')}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: string | null) => SCOPE_LABEL[(value as ReportScope) ?? 'all']}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SCOPE_LABEL) as ReportScope[]).map((item) => (
                <SelectItem key={item} value={item}>
                  {SCOPE_LABEL[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        {scope === 'domain' ? (
          <ChoiceField label="Domain" value={domain} options={DOMAIN_INTERESTS} onChange={setDomain} />
        ) : null}
        {scope === 'department' ? (
          <ChoiceField
            label="Department"
            value={department}
            options={DEPARTMENTS}
            onChange={setDepartment}
          />
        ) : null}
      </div>
      <div className="flex justify-end">
        <Button type="button" className="w-full sm:w-auto" onClick={exportPdf} disabled={disabled}>
          <FileDown />
          Export PDF
        </Button>
      </div>
    </div>
  )
}

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: string
  min?: string
  max?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-1">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <Input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="w-full"
      />
    </label>
  )
}

function ChoiceField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-1">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <Select value={value} onValueChange={(next) => onChange(next ?? value)}>
        <SelectTrigger className="w-full">
          <SelectValue>{(current: string | null) => current || label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}
