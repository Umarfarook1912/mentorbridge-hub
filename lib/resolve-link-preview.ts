/** Shared link-preview resolution (Medium-friendly). */

function extractMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Medium slugs sometimes include variation selectors / emoji that break OG lookup. */
export function mediumUrlCandidates(raw: string): string[] {
  const candidates: string[] = []
  const push = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !candidates.includes(trimmed)) candidates.push(trimmed)
  }

  push(raw)
  push(safeDecode(raw))

  for (const base of [...candidates]) {
    try {
      const url = new URL(base)
      if (!/medium\.com$/i.test(url.hostname) && !url.hostname.endsWith('.medium.com')) {
        continue
      }

      // Query params like ?postPublishedType=repub break some preview providers
      url.search = ''
      url.hash = ''

      let path = safeDecode(url.pathname)
      // Strip invisible / variation-selector chars (encoded or raw)
      path = path
        .replace(/%EF%B8%8F/gi, '')
        .replace(/%E2%80%8[B-D]/gi, '')
        .replace(/[\uFE0F\u200B-\u200D\uFEFF]/g, '')

      // Drop leading non-slug junk after /@user/ (emoji leftovers, dashes from stripped chars)
      path = path.replace(/(\/@[^/]+\/)[^\w]+/u, '$1')

      url.pathname = path
      push(url.toString())

      // Also try without any leading punctuation on the slug
      const slugOnly = path.replace(/(\/@[^/]+\/)(.*)$/u, (_m, prefix: string, slug: string) => {
        const cleanedSlug = slug.replace(/^[^a-zA-Z0-9]+/, '')
        return `${prefix}${cleanedSlug}`
      })
      if (slugOnly !== path) {
        const again = new URL(url.toString())
        again.pathname = slugOnly
        push(again.toString())
      }
    } catch {
      /* ignore */
    }
  }

  return candidates
}

export function isWeakPreview(imageUrl: string | null | undefined) {
  if (!imageUrl) return true
  return /resize:fill:64:64|\/fit:64:|:64:64\/|\/64\//i.test(imageUrl)
}

async function fetchMicrolinkImage(url: string) {
  try {
    const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true`
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const json = (await res.json()) as {
      status?: string
      data?: { image?: { url?: string } }
    }
    if (json.status !== 'success') return null
    return json.data?.image?.url ?? null
  } catch {
    return null
  }
}

async function fetchOgImage(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    })
    if (!res.ok) return null
    const html = await res.text()
    return (
      extractMetaContent(html, 'og:image') ||
      extractMetaContent(html, 'twitter:image') ||
      extractMetaContent(html, 'twitter:image:src')
    )
  } catch {
    return null
  }
}

/** Resolve the best preview image for a URL (tries Medium URL variants). */
export async function resolveLinkPreview(rawUrl: string): Promise<string | null> {
  const candidates = mediumUrlCandidates(rawUrl)
  let weakFallback: string | null = null

  for (const candidate of candidates) {
    const image = (await fetchMicrolinkImage(candidate)) || (await fetchOgImage(candidate))
    if (!image) continue
    if (!isWeakPreview(image)) return image
    weakFallback ??= image
  }

  return weakFallback
}
