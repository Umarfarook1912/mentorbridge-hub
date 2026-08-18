import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { IVideoEntity } from './videos.types'

async function fetchVideoById(id: string): Promise<IVideoEntity | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from('videos').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

async function fetchSimilarVideos(video: IVideoEntity): Promise<IVideoEntity[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('domain', video.domain)
    .neq('id', video.id)
    .order('view_count', { ascending: false })
    .limit(6)

  if (error) throw error
  return data ?? []
}

export function useGetVideoById(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.videos, 'detail', id],
    queryFn: () => fetchVideoById(id),
    enabled: !!id,
    staleTime: STALE_TIME.short,
  })
}

export function useGetSimilarVideos(video: IVideoEntity | null | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.videos, 'similar', video?.id, video?.domain],
    queryFn: () => fetchSimilarVideos(video!),
    enabled: !!video,
    staleTime: STALE_TIME.medium,
  })
}
