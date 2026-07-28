import type { AttendanceStatus } from '@/types/supabase.types'

export interface IAttendanceRecord {
  studentId: string
  status: AttendanceStatus
}

export interface IMarkAttendanceMutation {
  meetingId: string
  records: IAttendanceRecord[]
}
