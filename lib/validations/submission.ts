import { z } from 'zod'

const urlOrEmpty = z
  .string()
  .trim()
  .refine((val) => val === '' || z.string().url().safeParse(val).success, {
    message: 'Enter a valid URL (include https://)',
  })

export const submissionSchema = z
  .object({
    githubUrl: urlOrEmpty,
    googleDocUrl: urlOrEmpty,
    mediumBlogUrl: urlOrEmpty,
    otherUrl: urlOrEmpty,
    remarks: z.string().max(500, 'Remarks must be under 500 characters').optional(),
  })
  .superRefine((data, ctx) => {
    const hasLink = Boolean(
      data.githubUrl || data.googleDocUrl || data.mediumBlogUrl || data.otherUrl
    )
    if (!hasLink) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide at least one link (GitHub, Docs, Blog, or Other)',
        path: ['root'],
      })
    }
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
