import type { IVideoEntity } from '@/services/videos'

export function splitVideoSections(videos: IVideoEntity[]) {
  const mostViewed = [...videos].sort((a, b) => b.view_count - a.view_count).slice(0, 4)
  const mostViewedIds = new Set(mostViewed.map((v) => v.id))
  const remaining = videos.filter((v) => !mostViewedIds.has(v.id))
  return { mostViewed, remaining }
}
