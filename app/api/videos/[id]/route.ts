import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api/require-admin'
import { videoSchema } from '@/lib/validations/video'
import { parseYoutubeId, youtubeThumbnailUrl } from '@/lib/youtube-metadata'
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission('videos')
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const parsed = videoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid video data' },
      { status: 400 }
    )
  }

  const { title, youtubeUrl, domain } = parsed.data
  const youtubeId = parseYoutubeId(youtubeUrl)
  if (!youtubeId) {
    return NextResponse.json({ message: 'Enter a valid YouTube video link' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('videos')
    .update({
      title,
      youtube_url: youtubeUrl,
      youtube_id: youtubeId,
      thumbnail_url: youtubeThumbnailUrl(youtubeId),
      domain,
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  if (!data) {
    return NextResponse.json({ message: 'Video not found or update not allowed' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission('videos')
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const { error } = await auth.supabase.from('videos').delete().eq('id', id)
  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
