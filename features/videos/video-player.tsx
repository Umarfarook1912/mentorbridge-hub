'use client'

interface VideoPlayerProps {
  youtubeId: string
  title: string
}

export function VideoPlayer({ youtubeId, title }: VideoPlayerProps) {
  return (
    <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-xl border">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
