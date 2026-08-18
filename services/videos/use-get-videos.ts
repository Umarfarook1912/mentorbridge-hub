import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { IVideoEntity, IVideoFilters } from './videos.types'

async function fetchVideos(filters: IVideoFilters = {}): Promise<IVideoEntity[]> {
  const supabase = getSupabaseBrowserClient()
  let query = supabase.from('videos').select('*').order('created_at', { ascending: false })

  if (filters.domain && filters.domain !== 'All') {
    query = query.eq('domain', filters.domain)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export function useGetVideos(filters: IVideoFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.videos, filters],
    queryFn: () => fetchVideos(filters),
    staleTime: STALE_TIME.medium,
  })
}
