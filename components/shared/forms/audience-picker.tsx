'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { DOMAIN_INTERESTS } from '@/lib/constants'
import { Input } from '@/components/ui/input'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { cn } from '@/utils/cn'
import type { MeetingDomain } from '@/utils/meeting-audience'

export type AudienceDomain = MeetingDomain

interface AudiencePickerProps {
  domains: AudienceDomain[]
  studentIds: string[]
  onDomainsChange: (domains: AudienceDomain[]) => void
  onStudentIdsChange: (ids: string[]) => void
  label?: string
  description?: string
  error?: { message?: string }
}

export function AudiencePicker({
  domains,
  studentIds,
  onDomainsChange,
  onStudentIdsChange,
  label = 'Audience',
  description = 'All students, domain groups, and/or specific people. Groups and people combine.',
  error,
}: AudiencePickerProps) {
  const { data: students = [], isLoading } = useGetAllStudents()
  const [query, setQuery] = useState('')
  const isAll = domains.length === 0 && studentIds.length === 0

  const selectedStudents = useMemo(
    () => students.filter((s) => studentIds.includes(s.id)),
    [students, studentIds]
  )

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return students
      .filter((s) => !studentIds.includes(s.id))
      .filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.domain_interest ?? '').toLowerCase().includes(q)
      )
      .slice(0, 6)
  }, [students, studentIds, query])

  function selectAll() {
    onDomainsChange([])
    onStudentIdsChange([])
    setQuery('')
  }

  function toggleDomain(domain: MeetingDomain) {
    if (domains.includes(domain)) {
      onDomainsChange(domains.filter((d) => d !== domain))
    } else {
      onDomainsChange([...domains, domain])
    }
  }

  function addStudent(id: string) {
    if (!studentIds.includes(id)) onStudentIdsChange([...studentIds, id])
    setQuery('')
  }

  function removeStudent(id: string) {
    onStudentIdsChange(studentIds.filter((sid) => sid !== id))
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">
          {label} <span className="text-destructive">*</span>
        </p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={selectAll}
          className={cn(
            'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            isAll
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background hover:bg-muted'
          )}
        >
          All students
        </button>
        {DOMAIN_INTERESTS.map((domain) => {
          const selected = domains.includes(domain)
          return (
            <button
              key={domain}
              type="button"
              onClick={() => toggleDomain(domain)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background hover:bg-muted'
              )}
            >
              {domain}
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium">Add specific people</p>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isLoading ? 'Loading students…' : 'Search by name or email…'}
            className="pl-8"
            disabled={isLoading}
          />
          {suggestions.length > 0 && (
            <ul className="bg-popover absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border shadow-md">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="hover:bg-muted flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm"
                    onClick={() => addStudent(s.id)}
                  >
                    <span className="font-medium">{s.full_name}</span>
                    <span className="text-muted-foreground text-xs">
                      {s.domain_interest ?? 'No domain'} · {s.email}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedStudents.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedStudents.map((s) => (
              <span
                key={s.id}
                className="bg-secondary/15 text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
              >
                {s.full_name}
                <button
                  type="button"
                  aria-label={`Remove ${s.full_name}`}
                  onClick={() => removeStudent(s.id)}
                  className="hover:text-destructive rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error?.message ? <p className="text-destructive text-xs">{error.message}</p> : null}
    </div>
  )
}
