'use client'

import { SearchBar } from '@/components/shared/forms/search-bar'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DOMAIN_INTERESTS, type DomainInterest } from '@/lib/constants'

export type SubmissionTaskTime = 'active' | 'overdue'
export type SubmissionTaskDomain = 'All' | DomainInterest

export interface SubmissionTaskFiltersState {
  time: SubmissionTaskTime
  domain: SubmissionTaskDomain
  search: string
  dateFrom: string
  dateTo: string
}

interface TaskFilterInput {
  title: string
  assigned_by: string | null
  due_date: string
  target_domains: string[] | null
}

interface SubmissionsTaskFiltersProps {
  filters: SubmissionTaskFiltersState
  activeCount: number
  overdueCount: number
  onChange: <K extends keyof SubmissionTaskFiltersState>(
    key: K,
    value: SubmissionTaskFiltersState[K]
  ) => void
}

const DOMAIN_OPTIONS = [
  { value: 'All' as const, label: 'All domains' },
  ...DOMAIN_INTERESTS.map((d) => ({ value: d, label: d })),
]

function domainLabel(value: string | null) {
  return DOMAIN_OPTIONS.find((o) => o.value === value)?.label ?? 'All domains'
}

export function matchesSubmissionTask(task: TaskFilterInput, filters: SubmissionTaskFiltersState) {
  if (filters.domain !== 'All') {
    const targets = task.target_domains ?? []
    const openToAll = targets.length === 0 || targets.includes('General')
    if (!openToAll && !targets.includes(filters.domain)) return false
  }

  const query = filters.search.trim().toLowerCase()
  if (query) {
    const title = task.title.toLowerCase()
    const assignedBy = (task.assigned_by ?? '').toLowerCase()
    if (!title.includes(query) && !assignedBy.includes(query)) return false
  }

  if (filters.dateFrom && task.due_date < filters.dateFrom) return false
  if (filters.dateTo && task.due_date > filters.dateTo) return false
  return true
}

export function SubmissionsTaskFilters({
  filters,
  activeCount,
  overdueCount,
  onChange,
}: SubmissionsTaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar
          value={filters.search}
          onChange={(v) => onChange('search', v)}
          placeholder="Search by title or assignee…"
          className="w-full sm:w-64"
        />
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange('dateFrom', e.target.value)}
          className="w-full sm:w-auto"
          aria-label="From date"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange('dateTo', e.target.value)}
          className="w-full sm:w-auto"
          aria-label="To date"
        />
        <Select
          value={filters.domain}
          onValueChange={(v) => onChange('domain', v as SubmissionTaskDomain)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All domains">{domainLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DOMAIN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FilterPills
        aria-label="Task time"
        value={filters.time}
        onChange={(v) => onChange('time', v)}
        options={[
          { value: 'active', label: `Active (${activeCount})` },
          { value: 'overdue', label: `Overdue (${overdueCount})` },
        ]}
      />
    </div>
  )
}
