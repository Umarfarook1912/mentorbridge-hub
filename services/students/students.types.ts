import type { Database } from '@/types/supabase.types'

export type IStudentEntity = Database['public']['Tables']['profiles']['Row']

export interface IStudentMutation {
  fullName: string
  email: string
  phone?: string
  department: string
  domainInterest: string
  password?: string
}

export interface IStudentUpdateMutation {
  fullName?: string
  phone?: string
  department?: string
  domainInterest?: string
}

export interface IStudentFilters {
  search?: string
  department?: string
  page?: number
  pageSize?: number
}
