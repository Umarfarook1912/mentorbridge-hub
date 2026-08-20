import type { ContentTables } from '@/types/database.content-tables'
import type { AttendanceStatus, SubmissionStatus, UserRole } from '@/types/enums'

export type { AttendanceStatus, SubmissionStatus, UserRole }

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          department: string | null
          domain_interest: string | null
          student_category: string | null
          role: UserRole
          section_permissions: string[] | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          department?: string | null
          domain_interest?: string | null
          student_category?: string | null
          role?: UserRole
          section_permissions?: string[] | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          full_name?: string
          email?: string
          phone?: string | null
          department?: string | null
          domain_interest?: string | null
          student_category?: string | null
          role?: UserRole
          section_permissions?: string[] | null
          avatar_url?: string | null
        }
      }
      meetings: {
        Row: {
          id: string
          title: string
          description: string | null
          handled_by: string
          meeting_date: string
          start_time: string
          end_time: string
          duration: number | null
          meet_url: string | null
          attendance_mandatory: boolean
          target_domains: string[] | null
          target_student_ids: string[] | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          handled_by: string
          meeting_date: string
          start_time: string
          end_time: string
          meet_url?: string | null
          attendance_mandatory?: boolean
          target_domains?: string[] | null
          target_student_ids?: string[] | null
          created_by: string
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          handled_by?: string
          meeting_date?: string
          start_time?: string
          end_time?: string
          meet_url?: string | null
          attendance_mandatory?: boolean
          target_domains?: string[] | null
          target_student_ids?: string[] | null
        }
      }
      attendance: {
        Row: {
          id: string
          meeting_id: string
          student_id: string
          status: AttendanceStatus
          marked_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          student_id: string
          status?: AttendanceStatus
          marked_at?: string
        }
        Update: {
          status?: AttendanceStatus
          marked_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          due_date: string
          target_domains: string[] | null
          target_student_ids: string[] | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          due_date: string
          target_domains?: string[] | null
          target_student_ids?: string[] | null
          created_by: string
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          due_date?: string
          target_domains?: string[] | null
          target_student_ids?: string[] | null
        }
      }
    } & ContentTables
    Views: Record<string, never>
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
      increment_video_views: {
        Args: { video_id: string }
        Returns: number
      }
    }
    Enums: {
      user_role: UserRole
      attendance_status: AttendanceStatus
      submission_status: SubmissionStatus
    }
  }
}
