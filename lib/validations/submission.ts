import { z } from 'zod'

const urlOrEmpty = z.string().url('Enter a valid URL').optional().or(z.literal(''))

export const submissionSchema = z
  .object({
    githubUrl: urlOrEmpty,
    googleDocUrl: urlOrEmpty,
    mediumBlogUrl: urlOrEmpty,
    otherUrl: urlOrEmpty,
    remarks: z.string().max(500, 'Remarks must be under 500 characters').optional(),
  })
  .refine((data) => data.githubUrl || data.googleDocUrl || data.mediumBlogUrl || data.otherUrl, {
    message: 'At least one submission link is required',
    path: ['githubUrl'],
  })

export const feedbackSchema = z.object({
  feedback: z
    .string()
    .max(1000, 'Feedback must be under 1000 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['Approved', 'Rejected']),
})

export type SubmissionInput = z.infer<typeof submissionSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>
