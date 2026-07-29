import { z } from 'zod'

export const blogSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title must be under 150 characters'),
  mediumUrl: z
    .string()
    .url('Enter a valid Medium blog URL')
    .max(500, 'URL must be under 500 characters'),
})

export type BlogInput = z.infer<typeof blogSchema>
