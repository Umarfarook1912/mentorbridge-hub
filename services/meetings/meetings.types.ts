import type { Database } from '@/types/supabase.types'
import type { MeetingDomain } from '@/utils/meeting-audience'

export type IMeetingEntity = Database['public']['Tables']['meetings']['Row']

export interface IMeetingMutation {
  title: string
  description?: string
  handledBy: string
  meetingDate: string
  startTime: string
  endTime: string
  meetUrl?: string
  /** Empty = unrestricted by domain */
  targetDomains?: MeetingDomain[]
  /** Specific invitees; empty = none */
  targetStudentIds?: string[]
}
