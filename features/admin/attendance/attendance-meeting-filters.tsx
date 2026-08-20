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

export type AttendanceTimeFilter = 'today' | 'past'
export type AttendanceDomainFilter = 'All' | DomainInterest

export interface AttendanceFiltersState {
  time: AttendanceTimeFilter
  domain: AttendanceDomainFilter
  search: string
  dateFrom: string
  dateTo: string
}

interface AttendanceMeetingFiltersProps {
  filters: AttendanceFiltersState
  todayCount: number
  pastCount: number
  onChange: <K extends keyof AttendanceFiltersState>(
    key: K,
    value: AttendanceFiltersState[K]
  ) => void
}

const DOMAIN_OPTIONS = [
  { value: 'All' as const, label: 'All domains' },
  ...DOMAIN_INTERESTS.map((d) => ({ value: d, label: d })),
]

function domainLabel(value: string | null) {
  return DOMAIN_OPTIONS.find((o) => o.value === value)?.label ?? 'All domains'
}

export function AttendanceMeetingFilters({
  filters,
  todayCount,
  pastCount,
  onChange,
}: AttendanceMeetingFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar
          value={filters.search}
          onChange={(v) => onChange('search', v)}
          placeholder="Search by title or facilitator…"
          className="sm:w-64"
        />
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange('dateFrom', e.target.value)}
          className="w-auto"
          aria-label="From date"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange('dateTo', e.target.value)}
          className="w-auto"
          aria-label="To date"
        />
        <Select
          value={filters.domain}
          onValueChange={(v) => onChange('domain', v as AttendanceDomainFilter)}
        >
          <SelectTrigger className="w-44">
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
        aria-label="Meeting time"
        value={filters.time}
        onChange={(v) => onChange('time', v)}
        options={[
          { value: 'today', label: `Today (${todayCount})` },
          { value: 'past', label: `Past (${pastCount})` },
        ]}
      />
    </div>
  )
}
