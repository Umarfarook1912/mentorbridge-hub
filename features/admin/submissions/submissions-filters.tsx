'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTMENTS, DOMAIN_INTERESTS } from '@/lib/constants'

interface SubmissionsFiltersProps {
  statusFilter: string
  departmentFilter: string
  domainFilter: string
  total: number
  onStatusChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onDomainChange: (value: string) => void
}

export function SubmissionsFilters({
  statusFilter,
  departmentFilter,
  domainFilter,
  total,
  onStatusChange,
  onDepartmentChange,
  onDomainChange,
}: SubmissionsFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Select
        value={statusFilter || 'all'}
        onValueChange={(v) => onStatusChange(v === 'all' ? '' : (v ?? ''))}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="All status">
            {(value: string | null) => (!value || value === 'all' ? 'All Status' : value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={departmentFilter || 'all'}
        onValueChange={(v) => onDepartmentChange(v === 'all' ? '' : (v ?? ''))}
      >
        <SelectTrigger className="w-full sm:w-44">
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
        value={domainFilter || 'all'}
        onValueChange={(v) => onDomainChange(v === 'all' ? '' : (v ?? ''))}
      >
        <SelectTrigger className="w-full sm:w-44">
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

      <p className="text-muted-foreground text-sm sm:ml-auto">{total} submissions</p>
    </div>
  )
}
