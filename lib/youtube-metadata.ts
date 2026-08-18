export interface YoutubeMetadata {
  youtubeId: string
  title: string
  description: string | null
  thumbnailUrl: string
}

function extractMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtml(match[1])
  }
  return null
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export function parseYoutubeId(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    const host = url.hostname.replace(/^www\./i, '').toLowerCase()

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? null
    }

    const youtubeHosts = [
      'youtube.com',
      'm.youtube.com',
      'music.youtube.com',
      'youtube-nocookie.com',
    ]
    if (!youtubeHosts.includes(host)) return null

    const fromQuery = url.searchParams.get('v')
    if (fromQuery) return fromQuery

    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
      return parts[1] ?? null
    }
    return null
  } catch {
    return null
  }
}

export function youtubeThumbnailUrl(youtubeId: string) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
}

export function youtubeEmbedUrl(youtubeId: string) {
  return `https://www.youtube.com/embed/${youtubeId}`
}

async function fetchOembed(
  url: string
): Promise<{ title?: string; thumbnail_url?: string } | null> {
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await fetch(endpoint)
    if (!response.ok) return null
    return (await response.json()) as { title?: string; thumbnail_url?: string }
  } catch {
    return null
  }
}

async function fetchFullDescription(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (!response.ok) return null
    const html = await response.text()

    // Try to extract full description from ytInitialData JSON blob
    const match = html.match(/"description":\s*\{"simpleText":\s*"((?:[^"\\]|\\.)*)"\}/)
    if (match?.[1]) {
      return match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .trim()
    }

    // Fallback: og:description (truncated ~160 chars but better than nothing)
    return extractMetaContent(html, 'og:description')
  } catch {
    return null
  }
}

export async function resolveYoutubeMetadata(rawUrl: string): Promise<YoutubeMetadata | null> {
  const youtubeId = parseYoutubeId(rawUrl)
  if (!youtubeId) return null

  const canonical = `https://www.youtube.com/watch?v=${youtubeId}`
  const [oembed, description] = await Promise.all([
    fetchOembed(canonical),
    fetchFullDescription(canonical),
  ])

  return {
    youtubeId,
    title: oembed?.title?.trim() || 'Untitled recording',
    description,
    thumbnailUrl: oembed?.thumbnail_url || youtubeThumbnailUrl(youtubeId),
  }
}
