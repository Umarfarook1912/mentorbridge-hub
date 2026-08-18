import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { resolveYoutubeMetadata } from '@/lib/youtube-metadata'

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')?.trim()
  if (!url) {
    return NextResponse.json({ message: 'url is required' }, { status: 400 })
  }

  const metadata = await resolveYoutubeMetadata(url)
  if (!metadata) {
    return NextResponse.json({ message: 'Could not read this YouTube link' }, { status: 400 })
  }

  return NextResponse.json(metadata)
}
