'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TasksList } from '@/features/admin/tasks/tasks-list'
import { StudentTasksList } from '@/features/student/tasks/student-tasks-list'
import { useAuthStore } from '@/store/auth-store'

export function TasksPageContent() {
  const { user } = useAuthStore()
  const showMine = user?.role === 'Associate'

  if (!showMine) {
    return <TasksList />
  }

  return (
    <Tabs defaultValue="manage">
      <TabsList>
        <TabsTrigger value="manage">Manage tasks</TabsTrigger>
        <TabsTrigger value="mine">My tasks</TabsTrigger>
      </TabsList>
      <TabsContent value="manage" className="mt-4">
        <TasksList />
      </TabsContent>
      <TabsContent value="mine" className="mt-4">
        <StudentTasksList />
      </TabsContent>
    </Tabs>
  )
}
