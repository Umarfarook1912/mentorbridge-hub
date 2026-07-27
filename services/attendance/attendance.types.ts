import type { AttendanceStatus, Database } from '@/types/supabase.types'

export type IAttendanceEntity = Database['public']['Tables']['attendance']['Row']

export interface IAttendanceRecord {
  studentId: string
  status: AttendanceStatus
}

export interface IMarkAttendanceMutation {
  meetingId: string
  records: IAttendanceRecord[]
}

export interface IAttendanceWithProfile extends IAttendanceEntity {
  profiles: {
    full_name: string
    email: string
    department: string | null
    avatar_url: string | null
  }
}
