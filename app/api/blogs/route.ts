import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { resolveLinkPreview } from '@/lib/resolve-link-preview'

async function requireUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  return { supabase, user }
}

export async function POST(request: Request) {
  const auth = await requireUser()
  if ('error' in auth && auth.error) return auth.error

  const body = await request.json()
  const { title, mediumUrl, authorName } = body

  if (!title || !mediumUrl || !authorName) {
    return NextResponse.json(
      { message: 'Title, Medium URL and author name are required' },
      { status: 400 }
    )
  }

  // Resolve preview before insert when possible (short timeout via shared helper)
  const previewImageUrl = await resolveLinkPreview(mediumUrl)

  const { data, error } = await auth.supabase
    .from('blogs')
    .insert({
      title,
      medium_url: mediumUrl,
      author_id: auth.user.id,
      author_name: authorName,
      preview_image_url: previewImageUrl,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  // If preview wasn't ready in time, try once more in background
  if (!previewImageUrl) {
    void persistPreview(auth.supabase, data.id, mediumUrl)
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}

async function persistPreview(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  id: string,
  url: string
) {
  try {
    const image = await resolveLinkPreview(url)
    if (!image) return
    await supabase.from('blogs').update({ preview_image_url: image }).eq('id', id)
  } catch {
    /* ignore */
  }
}
