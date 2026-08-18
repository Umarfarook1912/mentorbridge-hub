import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api/require-admin'
import { videoSchema } from '@/lib/validations/video'
import { parseYoutubeId, youtubeThumbnailUrl } from '@/lib/youtube-metadata'

export async function POST(request: Request) {
  const auth = await requirePermission('videos')
  if ('error' in auth && auth.error) return auth.error

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
    .insert({
      title,
      youtube_url: youtubeUrl,
      youtube_id: youtubeId,
      thumbnail_url: youtubeThumbnailUrl(youtubeId),
      domain,
      created_by: auth.user.id,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
