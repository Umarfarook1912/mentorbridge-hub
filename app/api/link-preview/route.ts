import { NextResponse } from 'next/server'
import { resolveLinkPreview } from '@/lib/resolve-link-preview'

export async function POST(request: Request) {
  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const url = body.url?.trim()
  if (!url) {
    return NextResponse.json({ message: 'url is required' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 })
  }

  const image = await resolveLinkPreview(url)
  return NextResponse.json({ image: image ?? null })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ message: 'url is required' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 })
  }

  const image = await resolveLinkPreview(url)
  return NextResponse.json({ image: image ?? null })
}
