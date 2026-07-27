import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AttendanceReport } from '@/features/admin/reports/attendance-report'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analyse attendance patterns and task completion rates"
      />

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="tasks">Task Completion</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <AttendanceReport />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="bg-muted/30 rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground text-sm">Task completion analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
