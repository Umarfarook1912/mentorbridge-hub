'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
          <AlertTriangle className="text-destructive h-8 w-8" />
        </div>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
