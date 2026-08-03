import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME, PAGE_SIZE } from '@/lib/constants'
import type { IStudentFilters } from './students.types'

async function fetchStudents(filters: IStudentFilters) {
  const supabase = getSupabaseBrowserClient()
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .in('role', ['Student', 'Associate'])
    .order('created_at', { ascending: false })

  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  if (filters.department) {
    query = query.eq('department', filters.department)
  }

  if (filters.domainInterest) {
    query = query.eq('domain_interest', filters.domainInterest)
  }

  if (filters.studentCategory) {
    query = query.eq('student_category', filters.studentCategory)
  }

  const pageSize = filters.pageSize ?? PAGE_SIZE
  const page = filters.page ?? 1
  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

export function useGetStudents(filters: IStudentFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.students, filters],
    queryFn: () => fetchStudents(filters),
    staleTime: STALE_TIME.long,
  })
}

export function useGetAllStudents() {
  return useQuery({
    queryKey: [QUERY_KEYS.students, 'all'],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['Student', 'Associate'])
        .order('full_name')
      if (error) throw error
      return data ?? []
    },
    staleTime: STALE_TIME.long,
  })
}
