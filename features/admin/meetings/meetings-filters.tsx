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

export type MeetingTimeFilter = 'today' | 'past'
export type MeetingDomainFilter = 'All' | DomainInterest
export type MeetingAttendanceFilter = 'all' | 'mandatory' | 'optional'

export interface MeetingsFiltersState {
  time: MeetingTimeFilter
  domain: MeetingDomainFilter
  attendance: MeetingAttendanceFilter
  search: string
  dateFrom: string
  dateTo: string
}

interface MeetingsFiltersProps {
  filters: MeetingsFiltersState
  todayCount: number
  pastCount: number
  onChange: <K extends keyof MeetingsFiltersState>(
    key: K,
    value: MeetingsFiltersState[K]
  ) => void
}

const DOMAIN_OPTIONS = [
  { value: 'All' as const, label: 'All domains' },
  ...DOMAIN_INTERESTS.map((d) => ({ value: d, label: d })),
]

const ATTENDANCE_OPTIONS = [
  { value: 'all' as const, label: 'All attendance' },
  { value: 'mandatory' as const, label: 'Mandatory' },
  { value: 'optional' as const, label: 'Not mandatory' },
]

function domainLabel(value: string | null) {
  return DOMAIN_OPTIONS.find((o) => o.value === value)?.label ?? 'All domains'
}

function attendanceLabel(value: string | null) {
  return ATTENDANCE_OPTIONS.find((o) => o.value === value)?.label ?? 'All attendance'
}

export function MeetingsFilters({
  filters,
  todayCount,
  pastCount,
  onChange,
}: MeetingsFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: search + date range + dropdowns */}
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
          onValueChange={(v) => onChange('domain', v as MeetingDomainFilter)}
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

        <Select
          value={filters.attendance}
          onValueChange={(v) => onChange('attendance', v as MeetingAttendanceFilter)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All attendance">{attendanceLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ATTENDANCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Today / Past pills */}
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
