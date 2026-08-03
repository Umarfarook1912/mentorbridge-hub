import type { Database, UserRole } from '@/types/supabase.types'

export type IStudentEntity = Database['public']['Tables']['profiles']['Row']

export interface IStudentMutation {
  fullName: string
  email: string
  phone?: string
  studentCategory: string
  department: string
  domainInterest: string
  password?: string
}

export interface IStudentUpdateMutation {
  fullName?: string
  phone?: string
  studentCategory?: string
  department?: string
  domainInterest?: string
  role?: UserRole
}

export interface IStudentFilters {
  search?: string
  department?: string
  domainInterest?: string
  page?: number
  pageSize?: number
}
