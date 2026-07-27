import { Loader2 } from 'lucide-react'

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    </div>
  )
}
