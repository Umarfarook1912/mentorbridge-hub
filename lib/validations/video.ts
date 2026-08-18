import { z } from 'zod'
import { DOMAIN_INTERESTS } from '@/lib/constants'
import { parseYoutubeId } from '@/lib/youtube-metadata'

export const videoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title must be under 150 characters'),
  youtubeUrl: z
    .string()
    .trim()
    .url('Enter a valid YouTube URL')
    .max(500, 'URL must be under 500 characters')
    .refine((url) => !!parseYoutubeId(url), 'Enter a valid YouTube video link'),
  domain: z.enum(DOMAIN_INTERESTS, { message: 'Select a domain' }),
})

export type VideoInput = z.infer<typeof videoSchema>
