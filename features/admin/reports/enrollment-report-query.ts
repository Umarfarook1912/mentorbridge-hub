import { getEnrollmentStatus, type EnrollmentStatus } from '@/lib/enrollment'
import { DEPARTMENTS, DOMAIN_INTERESTS } from '@/lib/constants'
import type { IStudentEntity } from '@/services/students'
import type { EnrollmentGroups } from '../dashboard/enrollment-groups'

export type ReportScope = 'all' | 'ssm' | 'non-ssm' | 'domain' | 'department'

export interface EnrollmentReportQuery {
  from: string
  to: string
  scope: ReportScope
  domain: string
  department: string
}

const SCOPES: ReportScope[] = ['all', 'ssm', 'non-ssm', 'domain', 'department']

export function defaultReportQuery(from: string, to: string): EnrollmentReportQuery {
  return {
    from,
    to,
    scope: 'all',
    domain: DOMAIN_INTERESTS[0],
    department: DEPARTMENTS[0],
  }
}

export function parseReportQuery(
  params: { get: (key: string) => string | null },
  fallbackFrom: string,
  fallbackTo: string
): EnrollmentReportQuery {
  const scopeValue = params.get('scope')
  const scope = SCOPES.includes(scopeValue as ReportScope) ? (scopeValue as ReportScope) : 'all'
  const domain = params.get('domain') || DOMAIN_INTERESTS[0]
  const department = params.get('department') || DEPARTMENTS[0]
  const from = params.get('from') || fallbackFrom
  const to = params.get('to') || fallbackTo
  return {
    from,
    to: to < from ? from : to,
    scope,
    domain,
    department,
  }
}

export function reportScopeLabel(query: EnrollmentReportQuery) {
  if (query.scope === 'ssm') return 'SSM students'
  if (query.scope === 'non-ssm') return 'Non SSM students'
  if (query.scope === 'domain') return `Domain: ${query.domain}`
  if (query.scope === 'department') return `Department: ${query.department}`
  return 'All students'
}

function matchesScope(student: IStudentEntity, query: EnrollmentReportQuery) {
  if (query.scope === 'ssm') return student.student_category === 'SSM Student'
  if (query.scope === 'non-ssm') return student.student_category === 'Other College'
  if (query.scope === 'domain') return student.domain_interest === query.domain
  if (query.scope === 'department') return student.department === query.department
  return true
}

function statusOnDate(student: IStudentEntity, to: string): EnrollmentStatus | null {
  if (student.created_at.slice(0, 10) > to) return null
  const inactive = student.inactive_at?.slice(0, 10)
  if (student.is_active === false && (!inactive || inactive <= to)) return 'inactive'
  if (getEnrollmentStatus(student) === 'company') {
    const joined = student.company_joined_at?.slice(0, 10)
    if (!joined || joined <= to) return 'company'
  }
  return 'active'
}

function inPeriod(student: IStudentEntity, status: EnrollmentStatus, from: string, to: string) {
  if (status === 'inactive') {
    const date = student.inactive_at?.slice(0, 10)
    return !date || (date >= from && date <= to)
  }
  if (status === 'company') {
    const date = student.company_joined_at?.slice(0, 10)
    return !date || (date >= from && date <= to)
  }
  return true
}

export function reportGroups(students: IStudentEntity[], query: EnrollmentReportQuery): EnrollmentGroups {
  const groups: EnrollmentGroups = { active: [], inactive: [], company: [] }
  for (const student of students) {
    if (student.role !== 'Student' && student.role !== 'Executive') continue
    if (!matchesScope(student, query)) continue
    const status = statusOnDate(student, query.to)
    if (!status || !inPeriod(student, status, query.from, query.to)) continue
    if (student.role === 'Executive') {
      if (status === 'active') groups.active.push(student)
      continue
    }
    groups[status].push(student)
  }
  for (const status of Object.keys(groups) as EnrollmentStatus[]) {
    groups[status].sort((a, b) => a.full_name.localeCompare(b.full_name))
  }
  return groups
}

export function countFromGroups(groups: EnrollmentGroups) {
  const counts = new Map<string, { active: number; inactive: number; company: number }>()
  for (const status of ['active', 'inactive', 'company'] as const) {
    for (const student of groups[status]) {
      const department = student.department?.trim() || '—'
      const row = counts.get(department) ?? { active: 0, inactive: 0, company: 0 }
      row[status] += 1
      counts.set(department, row)
    }
  }
  return [...counts.entries()]
    .map(([department, row]) => ({
      department,
      ...row,
      total: row.active + row.inactive + row.company,
    }))
    .sort((a, b) => b.total - a.total || a.department.localeCompare(b.department))
}

export function reportSearch(query: EnrollmentReportQuery) {
  const params = new URLSearchParams({
    from: query.from,
    to: query.to,
    scope: query.scope,
  })
  if (query.scope === 'domain') params.set('domain', query.domain)
  if (query.scope === 'department') params.set('department', query.department)
  return params.toString()
}
