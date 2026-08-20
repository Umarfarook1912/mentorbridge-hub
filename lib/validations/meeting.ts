import { z } from 'zod'
import { DOMAIN_INTERESTS } from '@/lib/constants'

export const meetingSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    handledBy: z.string().min(2, 'Please enter the facilitator name'),
    meetingDate: z.string().min(1, 'Select a meeting date'),
    startTime: z.string().min(1, 'Select a start time'),
    endTime: z.string().min(1, 'Select an end time'),
    meetUrl: z
      .string()
      .optional()
      .refine((v) => !v || /^https?:\/\/.+/i.test(v), 'Enter a valid meeting URL'),
    attendanceMandatory: z.boolean(),
    targetDomains: z.array(z.enum(DOMAIN_INTERESTS)),
    targetStudentIds: z.array(z.string().uuid()),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      return data.endTime > data.startTime
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  )

export type MeetingInput = z.infer<typeof meetingSchema>

export const multiMeetingSchema = z.object({
  meetings: z.array(meetingSchema).min(1, 'Add at least one meeting'),
})

export type MultiMeetingInput = z.infer<typeof multiMeetingSchema>
