import type { getSupabaseServerClient } from '@/lib/supabase/server'

export async function clearOtherFeatured(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  domain: string,
  exceptId?: string
) {
  let query = supabase
    .from('videos')
    .update({ is_featured: false })
    .eq('domain', domain)
    .eq('is_featured', true)
  if (exceptId) query = query.neq('id', exceptId)
  await query
}
