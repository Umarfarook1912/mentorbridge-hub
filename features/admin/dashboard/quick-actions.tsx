'use client'

import { useRouter } from 'next/navigation'
import { UserPlus, CalendarPlus, ClipboardPlus, Download } from 'lucide-react'
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import { canMutate } from '@/lib/permissions'

const QUICK_ACTIONS = [
  {
    label: 'Add Student',
    icon: UserPlus,
    href: ROUTES.admin.students,
    description: 'Enroll a new student',
  },
  {
    label: 'Create Meeting',
    icon: CalendarPlus,
    href: ROUTES.admin.meetings,
    description: 'Schedule a session',
  },
  {
    label: 'Create Task',
    icon: ClipboardPlus,
    href: ROUTES.admin.tasks,
    description: 'Assign a new task',
  },
  {
    label: 'Export Report',
    icon: Download,
    href: ROUTES.admin.reports,
    description: 'Download attendance',
  },
]

export function QuickActions() {
  const router = useRouter()
  const { user } = useAuthStore()
  const actions = canMutate(user)
    ? QUICK_ACTIONS
    : QUICK_ACTIONS.filter((action) => action.href === ROUTES.admin.reports)

  return (
    <FeatureCardSection title="Quick Actions">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => router.push(action.href)}
              className="border-border/70 bg-background/80 hover:bg-muted/50 flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all hover:shadow-sm active:scale-[0.98]"
            >
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Icon className="text-primary h-4 w-4" />
              </div>
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-muted-foreground text-xs">{action.description}</p>
            </button>
          )
        })}
      </div>
    </FeatureCardSection>
  )
}
