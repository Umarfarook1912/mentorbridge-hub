import type { Database } from '@/types/supabase.types'

export type IMeetingEntity = Database['public']['Tables']['meetings']['Row']

export interface IMeetingMutation {
  title: string
  description?: string
  handledBy: string
  meetingDate: string
  startTime: string
  endTime: string
  meetUrl?: string
}
