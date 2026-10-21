'use client'

import { Building2, UserCheck, UserX } from 'lucide-react'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { activeWithExecutives, groupStudents, trainingStudents } from './enrollment-groups'
import { EnrollmentReportControls } from './enrollment-report-controls'
import { EnrollmentStudentList } from './enrollment-student-list'

const CARDS = [
  {
    status: 'active' as const,
    title: 'Active',
    description: 'Students and executives in training',
    icon: UserCheck,
    accent: 'success' as const,
  },
  {
    status: 'inactive' as const,
    title: 'Inactive',
    description: 'Left the program',
    icon: UserX,
    accent: 'muted' as const,
  },
  {
    status: 'company' as const,
    title: 'Company',
    description: 'Placed with a company',
    icon: Building2,
    accent: 'brand' as const,
  },
]

export function EnrollmentOverview() {
  const { data: students = [], isLoading } = useGetAllStudents()
  const trainees = trainingStudents(students)
  const groups = activeWithExecutives(students, groupStudents(trainees))

  if (isLoading) return <LoadingSkeleton />

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Enrollment</h2>
        <p className="text-muted-foreground text-sm">
          Active, inactive, and company students, with name, department, and domain
        </p>
      </div>
      <EnrollmentReportControls students={students} disabled={!students.length} />

      <div className="grid gap-4 lg:grid-cols-3">
        {CARDS.map((card) => {
          const list = groups[card.status]
          const Icon = card.icon
          return (
            <FeatureCard key={card.status} accent={card.accent} contentClassName="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{list.length}</p>
                  <p className="text-muted-foreground text-xs">{card.description}</p>
                </div>
                <div className="bg-muted text-foreground rounded-xl p-2.5">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <EnrollmentStudentList students={list} status={card.status} />
            </FeatureCard>
          )
        })}
      </div>
    </section>
  )
}
