'use client'

import { BookOpen, Code2, FileText, Globe } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SubmissionLinkIconsProps {
  githubUrl?: string | null
  googleDocUrl?: string | null
  mediumBlogUrl?: string | null
  otherUrl?: string | null
  className?: string
}

function LinkIcon({
  href,
  title,
  children,
}: {
  href: string
  title: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1"
      title={title}
    >
      {children}
    </a>
  )
}

export function SubmissionLinkIcons({
  githubUrl,
  googleDocUrl,
  mediumBlogUrl,
  otherUrl,
  className,
}: SubmissionLinkIconsProps) {
  if (!githubUrl && !googleDocUrl && !mediumBlogUrl && !otherUrl) {
    return <span className="text-muted-foreground text-xs">—</span>
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {githubUrl ? (
        <LinkIcon href={githubUrl} title="GitHub">
          <Code2 className="h-3.5 w-3.5" />
        </LinkIcon>
      ) : null}
      {googleDocUrl ? (
        <LinkIcon href={googleDocUrl} title="Google Doc">
          <FileText className="h-3.5 w-3.5" />
        </LinkIcon>
      ) : null}
      {mediumBlogUrl ? (
        <LinkIcon href={mediumBlogUrl} title="Medium">
          <BookOpen className="h-3.5 w-3.5" />
        </LinkIcon>
      ) : null}
      {otherUrl ? (
        <LinkIcon href={otherUrl} title="Other / portfolio">
          <Globe className="h-3.5 w-3.5" />
        </LinkIcon>
      ) : null}
    </div>
  )
}
