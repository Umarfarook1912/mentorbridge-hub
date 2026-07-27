import type { Database } from '@/types/supabase.types'

export type ITaskEntity = Database['public']['Tables']['tasks']['Row']
export type ISubmissionEntity = Database['public']['Tables']['task_submissions']['Row']

export interface ITaskMutation {
  title: string
  description?: string
  dueDate: string
  department?: string | null
}

export interface ISubmissionMutation {
  taskId: string
  githubUrl?: string
  googleDocUrl?: string
  mediumBlogUrl?: string
  remarks?: string
}

export interface IReviewMutation {
  submissionId: string
  status: 'Approved' | 'Rejected'
  feedback: string
  reviewedBy?: string
}
