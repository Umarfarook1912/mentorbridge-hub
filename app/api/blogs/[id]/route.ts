import { NextResponse } from 'next/server'
import { getSupabaseAdminClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { isWeakPreview, resolveLinkPreview } from '@/lib/resolve-link-preview'

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const { title, mediumUrl, refreshPreviewOnly, force } = body as {
    title?: string
    mediumUrl?: string
    refreshPreviewOnly?: boolean
    force?: boolean
  }

  const { data: existing, error: findError } = await auth.supabase
    .from('blogs')
    .select('id, author_id, medium_url, preview_image_url')
    .eq('id', id)
    .maybeSingle()

  if (findError) {
    return NextResponse.json({ message: findError.message }, { status: 400 })
  }
  if (!existing) {
    return NextResponse.json({ message: 'Blog not found' }, { status: 404 })
  }

  // Any authenticated user can backfill a missing/weak preview
  if (refreshPreviewOnly) {
    if (existing.preview_image_url && !force && !isWeakPreview(existing.preview_image_url)) {
      return NextResponse.json({ image: existing.preview_image_url })
    }

    const image = await resolveLinkPreview(existing.medium_url)
    if (!image) {
      return NextResponse.json({ image: null })
    }

    // Don't replace a good preview with a weak avatar
    if (
      isWeakPreview(image) &&
      existing.preview_image_url &&
      !isWeakPreview(existing.preview_image_url)
    ) {
      return NextResponse.json({ image: existing.preview_image_url })
    }

    const admin = await getSupabaseAdminClient()
    await admin.from('blogs').update({ preview_image_url: image }).eq('id', id)

    return NextResponse.json({ image })
  }

  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('role, section_permissions')
    .eq('id', auth.user.id)
    .single()

  if (profile?.role === 'Staff') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const canModerate =
    profile?.role === 'Admin' ||
    (profile?.role === 'Executive' && (profile.section_permissions ?? []).includes('blogs'))
  if (existing.author_id !== auth.user.id && !canModerate) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  if (!title || !mediumUrl) {
    return NextResponse.json({ message: 'Title and Medium URL are required' }, { status: 400 })
  }

  const urlChanged = existing.medium_url !== mediumUrl
  const nextPreview = urlChanged ? await resolveLinkPreview(mediumUrl) : existing.preview_image_url

  const { data, error } = await auth.supabase
    .from('blogs')
    .update({
      title,
      medium_url: mediumUrl,
      ...(nextPreview ? { preview_image_url: nextPreview } : {}),
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
  if (!data) {
    return NextResponse.json({ message: 'Update failed' }, { status: 400 })
  }

  if (urlChanged && !nextPreview) {
    void persistPreview(id, mediumUrl)
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params

  const { data: existing } = await auth.supabase
    .from('blogs')
    .select('id, author_id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ message: 'Blog not found' }, { status: 404 })
  }

  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('role, section_permissions')
    .eq('id', auth.user.id)
    .single()

  if (profile?.role === 'Staff') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const canModerate =
    profile?.role === 'Admin' ||
    (profile?.role === 'Executive' && (profile.section_permissions ?? []).includes('blogs'))
  if (existing.author_id !== auth.user.id && !canModerate) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const { error } = await auth.supabase.from('blogs').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

async function persistPreview(id: string, url: string) {
  try {
    const image = await resolveLinkPreview(url)
    if (!image) return
    const admin = await getSupabaseAdminClient()
    await admin.from('blogs').update({ preview_image_url: image }).eq('id', id)
  } catch {
    /* ignore */
  }
}
