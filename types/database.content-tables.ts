import type { SubmissionStatus } from '@/types/enums'

export interface ContentTables {
  task_submissions: {
    Row: {
      id: string
      task_id: string
      student_id: string
      github_url: string | null
      google_doc_url: string | null
      medium_blog_url: string | null
      other_url: string | null
      remarks: string | null
      feedback: string | null
      submitted_at: string
      status: SubmissionStatus
      reviewed_by: string | null
      reviewed_by_name: string | null
      reviewed_at: string | null
    }
    Insert: {
      id?: string
      task_id: string
      student_id: string
      github_url?: string | null
      google_doc_url?: string | null
      medium_blog_url?: string | null
      other_url?: string | null
      remarks?: string | null
      feedback?: string | null
      submitted_at?: string
      status?: SubmissionStatus
      reviewed_by?: string | null
      reviewed_by_name?: string | null
      reviewed_at?: string | null
    }
    Update: {
      github_url?: string | null
      google_doc_url?: string | null
      medium_blog_url?: string | null
      other_url?: string | null
      remarks?: string | null
      feedback?: string | null
      status?: SubmissionStatus
      reviewed_by?: string | null
      reviewed_by_name?: string | null
      reviewed_at?: string | null
    }
  }
  notifications: {
    Row: {
      id: string
      user_id: string
      title: string
      body: string | null
      type: string
      is_read: boolean
      created_at: string
    }
    Insert: {
      id?: string
      user_id: string
      title: string
      body?: string | null
      type: string
      is_read?: boolean
      created_at?: string
    }
    Update: {
      is_read?: boolean
    }
  }
  blogs: {
    Row: {
      id: string
      title: string
      medium_url: string
      preview_image_url: string | null
      author_id: string
      author_name: string
      created_at: string
    }
    Insert: {
      id?: string
      title: string
      medium_url: string
      preview_image_url?: string | null
      author_id: string
      author_name: string
      created_at?: string
    }
    Update: {
      title?: string
      medium_url?: string
      preview_image_url?: string | null
      author_name?: string
    }
  }
  videos: {
    Row: {
      id: string
      title: string
      description: string | null
      youtube_url: string
      youtube_id: string
      thumbnail_url: string | null
      domain: string
      is_featured: boolean
      view_count: number
      created_by: string
      created_at: string
    }
    Insert: {
      id?: string
      title: string
      description?: string | null
      youtube_url: string
      youtube_id: string
      thumbnail_url?: string | null
      domain: string
      is_featured?: boolean
      view_count?: number
      created_by: string
      created_at?: string
    }
    Update: {
      title?: string
      description?: string | null
      youtube_url?: string
      youtube_id?: string
      thumbnail_url?: string | null
      domain?: string
      is_featured?: boolean
      view_count?: number
    }
  }
}
