import type { Database } from '@/types/supabase.types'
import type { MeetingDomain } from '@/utils/meeting-audience'

export type ITaskEntity = Database['public']['Tables']['tasks']['Row']

export interface ITaskMutation {
  title: string
  description?: string
  assignedBy: string
  dueDate: string
  targetDomains?: MeetingDomain[]
  targetStudentIds?: string[]
}

export interface ISubmissionMutation {
  taskId: string
  githubUrl?: string
  googleDocUrl?: string
  mediumBlogUrl?: string
  otherUrl?: string
  remarks?: string
}

export interface IReviewMutation {
  submissionId: string
  status: 'Approved' | 'Rejected'
  feedback?: string
}
