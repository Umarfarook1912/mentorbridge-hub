'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchBar } from '@/components/shared/forms/search-bar'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { DEPARTMENTS, DOMAIN_INTERESTS } from '@/lib/constants'

interface StudentsListFiltersProps {
  search: string
  studentCategory: string
  isActiveFilter: 'all' | 'active' | 'inactive'
  department: string
  domainInterest: string
  canWrite: boolean
  onSearchChange: (v: string) => void
  onStudentCategoryChange: (v: string) => void
  onIsActiveFilterChange: (v: 'all' | 'active' | 'inactive') => void
  onDepartmentChange: (v: string) => void
  onDomainInterestChange: (v: string) => void
  onAddClick: () => void
}

export function StudentsListFilters({
  search,
  studentCategory,
  isActiveFilter,
  department,
  domainInterest,
  canWrite,
  onSearchChange,
  onStudentCategoryChange,
  onIsActiveFilterChange,
  onDepartmentChange,
  onDomainInterestChange,
  onAddClick,
}: StudentsListFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name or email…"
        className="sm:w-72"
      />
      <Select
        value={studentCategory || 'all'}
        onValueChange={(v) => onStudentCategoryChange(v === 'all' ? '' : (v ?? ''))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All types">
            {(value: string | null) => {
              if (!value || value === 'all') return 'All types'
              if (value === 'SSM Student') return 'SSM'
              if (value === 'Other College') return 'Non SSM'
              return value
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="SSM Student">SSM</SelectItem>
          <SelectItem value="Other College">Non SSM</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={isActiveFilter}
        onValueChange={(v) =>
          onIsActiveFilterChange((v as 'all' | 'active' | 'inactive') ?? 'all')
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All status">
            {(value: string | null) => {
              if (!value || value === 'all') return 'All status'
              if (value === 'active') return 'Active'
              if (value === 'inactive') return 'Inactive'
              return value
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={department || 'all'}
        onValueChange={(v) => onDepartmentChange(v === 'all' ? '' : (v ?? ''))}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All departments">
            {(value: string | null) => (!value || value === 'all' ? 'All departments' : value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All departments</SelectItem>
          {DEPARTMENTS.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={domainInterest || 'all'}
        onValueChange={(v) => onDomainInterestChange(v === 'all' ? '' : (v ?? ''))}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All domains">
            {(value: string | null) => (!value || value === 'all' ? 'All domains' : value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All domains</SelectItem>
          {DOMAIN_INTERESTS.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {canWrite ? (
        <div className="sm:ml-auto">
          <Button onClick={onAddClick}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      ) : null}
    </div>
  )
}
