import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'list' | 'stats'
  count?: number
  className?: string
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card space-y-3 rounded-xl border p-5">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ count }: { count: number }) {
  return (
    <div className="rounded-xl border">
      <div className="flex items-center gap-4 border-b px-4 py-3">
        {[40, 24, 20, 16].map((w, i) => (
          <Skeleton key={i} className={`h-4 w-${w}`} />
        ))}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function CardSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card space-y-3 rounded-xl border p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ListSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card flex items-center gap-3 rounded-lg border px-4 py-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function LoadingSkeleton({ variant = 'list', count = 5, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {variant === 'stats' && <StatsGridSkeleton />}
      {variant === 'table' && <TableSkeleton count={count} />}
      {variant === 'card' && <CardSkeleton count={count} />}
      {variant === 'list' && <ListSkeleton count={count} />}
    </div>
  )
}
