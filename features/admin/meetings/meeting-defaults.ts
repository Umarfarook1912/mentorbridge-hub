import type { MeetingInput } from '@/lib/validations/meeting'

export const EMPTY_MEETING: MeetingInput = {
  title: '',
  description: '',
  handledBy: '',
  meetingDate: '',
  startTime: '',
  endTime: '',
  meetUrl: '',
  attendanceMandatory: true,
  targetDomains: [],
  targetStudentIds: [],
}
