'use client'

import { UserX } from 'lucide-react'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'

export interface UnsubmittedStudent {
  id: string
  full_name: string
  email: string
  department: string | null
  domain_interest: string | null
  avatar_url: string | null
}

interface UnsubmittedStudentsListProps {
  students: UnsubmittedStudent[]
  isLoading?: boolean
}

export function UnsubmittedStudentsList({ students, isLoading }: UnsubmittedStudentsListProps) {
  if (isLoading) return <LoadingSkeleton />

  if (!students.length) {
    return (
      <EmptyState
        icon={UserX}
        title="Everyone has submitted"
        description="All assigned students have turned in this task"
      />
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">
        {students.length} student{students.length === 1 ? '' : 's'} have not submitted
      </p>
      <ul className="divide-border divide-y rounded-lg border">
        {students.map((student) => (
          <li key={student.id} className="flex items-center gap-3 px-3 py-2.5">
            <UserAvatar name={student.full_name} avatarUrl={student.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{student.full_name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {[student.domain_interest, student.department, student.email]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
