import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
          <FileQuestion className="text-muted-foreground h-8 w-8" />
        </div>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button render={<Link href="/" />}>Go Home</Button>
      </div>
    </div>
  )
}
