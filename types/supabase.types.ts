export type UserRole = 'Admin' | 'Executive' | 'Staff' | 'Student'
export type AttendanceStatus = 'Present' | 'Absent' | 'Permission'
export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected'

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
    }
    Views: Record<string, never>
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
      attendance_status: AttendanceStatus
      submission_status: SubmissionStatus
    }
  }
}
