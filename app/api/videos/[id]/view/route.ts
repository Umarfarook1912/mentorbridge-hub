import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { data, error } = await supabase.rpc('increment_video_views', { video_id: id })

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json({ viewCount: data ?? null })
}
