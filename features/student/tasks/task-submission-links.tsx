'use client'

import { ExternalLink } from 'lucide-react'

interface TaskSubmissionLinksProps {
  githubUrl?: string | null
  googleDocUrl?: string | null
  mediumBlogUrl?: string | null
  otherUrl?: string | null
}

export function TaskSubmissionLinks({
  githubUrl,
  googleDocUrl,
  mediumBlogUrl,
  otherUrl,
}: TaskSubmissionLinksProps) {
  if (!githubUrl && !googleDocUrl && !mediumBlogUrl && !otherUrl) return null

  const linkClass =
    'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors'

  return (
    <div className="border-border/60 mt-3 flex flex-wrap gap-2 border-t pt-3">
      {githubUrl ? (
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <ExternalLink className="h-3 w-3" /> GitHub
        </a>
      ) : null}
      {googleDocUrl ? (
        <a href={googleDocUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <ExternalLink className="h-3 w-3" /> Doc
        </a>
      ) : null}
      {mediumBlogUrl ? (
        <a href={mediumBlogUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <ExternalLink className="h-3 w-3" /> Blog
        </a>
      ) : null}
      {otherUrl ? (
        <a href={otherUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <ExternalLink className="h-3 w-3" /> Other
        </a>
      ) : null}
    </div>
  )
}
