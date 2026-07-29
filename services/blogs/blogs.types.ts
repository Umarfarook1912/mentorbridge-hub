import type { Database } from '@/types/supabase.types'

export type IBlogEntity = Database['public']['Tables']['blogs']['Row']

export interface IBlogMutation {
  title: string
  mediumUrl: string
  authorId: string
  authorName: string
  previewImageUrl?: string | null
}
