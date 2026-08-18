import type { IVideoEntity } from '@/services/videos'

export function pickFeatured(videos: IVideoEntity[]) {
  const featured = videos.filter((video) => video.is_featured)
  if (!featured.length) return null
  return [...featured].sort((a, b) => b.view_count - a.view_count)[0]
}

export function splitVideoSections(videos: IVideoEntity[]) {
  const featured = pickFeatured(videos)
  const rest = featured ? videos.filter((video) => video.id !== featured.id) : videos
  const mostViewed = [...rest].sort((a, b) => b.view_count - a.view_count).slice(0, 4)
  const mostViewedIds = new Set(mostViewed.map((video) => video.id))
  const remaining = rest.filter((video) => !mostViewedIds.has(video.id))
  return { featured, mostViewed, remaining }
}
