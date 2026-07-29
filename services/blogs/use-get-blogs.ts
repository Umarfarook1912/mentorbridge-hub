import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { IBlogEntity } from './blogs.types'

async function fetchBlogs(): Promise<IBlogEntity[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function useGetBlogs() {
  return useQuery({
    queryKey: [QUERY_KEYS.blogs],
    queryFn: fetchBlogs,
    staleTime: STALE_TIME.medium,
  })
}
