'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTMENTS, DOMAIN_INTERESTS } from '@/lib/constants'
import { cn } from '@/utils/cn'

interface StudentOption {
  id: string
  full_name: string
}

interface ReportFiltersProps {
  fullReport: boolean
  fromMonth: string
  toMonth: string
  studentId: string
  department: string
  domain: string
  students: StudentOption[]
  canExport: boolean
  onFullReportChange: (full: boolean) => void
  onFromMonthChange: (month: string) => void
  onToMonthChange: (month: string) => void
  onStudentChange: (studentId: string) => void
  onDepartmentChange: (department: string) => void
  onDomainChange: (domain: string) => void
  onExport: () => void
}

export function ReportFilters({
  fullReport,
  fromMonth,
  toMonth,
  studentId,
  department,
  domain,
  students,
  canExport,
  onFullReportChange,
  onFromMonthChange,
  onToMonthChange,
  onStudentChange,
  onDepartmentChange,
  onDomainChange,
  onExport,
}: ReportFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onFullReportChange(false)}
          className={cn(
            'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            !fullReport
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background hover:bg-muted'
          )}
        >
          Month range
        </button>
        <button
          type="button"
          onClick={() => onFullReportChange(true)}
          className={cn(
            'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            fullReport
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background hover:bg-muted'
          )}
        >
          Full report
        </button>
        {!fullReport ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-muted-foreground text-xs font-medium">From</label>
            <input
              type="month"
              value={fromMonth}
              onChange={(e) => onFromMonthChange(e.target.value)}
              className="bg-background h-9 rounded-md border px-3 text-sm"
            />
            <label className="text-muted-foreground text-xs font-medium">To</label>
            <input
              type="month"
              value={toMonth}
              min={fromMonth}
              onChange={(e) => onToMonthChange(e.target.value)}
              className="bg-background h-9 rounded-md border px-3 text-sm"
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">All meetings from the start through now</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={studentId || 'all'}
          onValueChange={(v) => onStudentChange(v === 'all' ? '' : (v ?? ''))}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All students">
              {(value: string | null) => {
                if (!value || value === 'all') return 'All Students'
                return students.find((s) => s.id === value)?.full_name ?? 'All Students'
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={department || 'all'}
          onValueChange={(v) => onDepartmentChange(v === 'all' ? '' : (v ?? ''))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All departments">
              {(value: string | null) => (!value || value === 'all' ? 'All Departments' : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={domain || 'all'}
          onValueChange={(v) => onDomainChange(v === 'all' ? '' : (v ?? ''))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All domains">
              {(value: string | null) => (!value || value === 'all' ? 'All Domains' : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {DOMAIN_INTERESTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={onExport}
          disabled={!canExport}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>
    </div>
  )
}
