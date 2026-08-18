'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

interface VideoPreview {
  youtubeId: string
  title: string
  description: string | null
  thumbnailUrl: string
}

export function useVideoPreview(youtubeUrl: string, enabled: boolean) {
  const [preview, setPreview] = useState<VideoPreview | null>(null)
  const [fetchedUrl, setFetchedUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const debouncedUrl = useDebounce(youtubeUrl, 500)

  useEffect(() => {
    if (!enabled || !debouncedUrl.trim()) return

    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/videos/preview?url=${encodeURIComponent(debouncedUrl)}`)
        const data = (await response.json()) as VideoPreview & { message?: string }
        if (cancelled) return
        setFetchedUrl(debouncedUrl)
        setPreview(response.ok ? data : null)
      } catch {
        if (cancelled) return
        setFetchedUrl(debouncedUrl)
        setPreview(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [debouncedUrl, enabled])

  const active = enabled && !!debouncedUrl.trim()
  const matches = active && fetchedUrl === debouncedUrl

  return {
    preview: matches ? preview : null,
    isLoading: active && (isLoading || !matches),
  }
}
