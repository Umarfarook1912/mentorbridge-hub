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
import { DEPARTMENTS } from '@/lib/constants'

interface StudentOption {
  id: string
  full_name: string
}

interface TaskCompletionReportFiltersProps {
  month: string
  studentId: string
  department: string
  students: StudentOption[]
  canExport: boolean
  onMonthChange: (month: string) => void
  onStudentChange: (studentId: string) => void
  onDepartmentChange: (department: string) => void
  onExport: () => void
}

export function TaskCompletionReportFilters({
  month,
  studentId,
  department,
  students,
  canExport,
  onMonthChange,
  onStudentChange,
  onDepartmentChange,
  onExport,
}: TaskCompletionReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="month"
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        className="bg-background h-9 rounded-md border px-3 text-sm"
      />
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
  )
}
