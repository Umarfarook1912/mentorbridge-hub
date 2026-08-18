import type { Database } from '@/types/supabase.types'
import type { DomainInterest } from '@/lib/constants'

export type IVideoEntity = Database['public']['Tables']['videos']['Row']

export interface IVideoMutation {
  title: string
  youtubeUrl: string
  domain: DomainInterest
}

export interface IVideoFilters {
  domain?: DomainInterest | 'All'
}
