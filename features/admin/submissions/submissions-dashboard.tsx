'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubmissionsTaskList } from './submissions-task-list'
import { TaskSubmissionsPanel } from './task-submissions-panel'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { formatDate } from '@/utils/format'

export function SubmissionsDashboard() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.tasks, 'with-submission-counts'],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*, task_submissions(id, status)')
        .order('due_date', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    staleTime: STALE_TIME.short,
  })

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

  if (selectedTaskId && selectedTask) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setSelectedTaskId(null)}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            All tasks
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl leading-snug font-semibold break-words">{selectedTask.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Due {formatDate(selectedTask.due_date)}
              {selectedTask.assigned_by ? ` · Assigned by ${selectedTask.assigned_by}` : ''}
            </p>
          </div>
        </div>

        <TaskSubmissionsPanel
          key={selectedTaskId}
          taskId={selectedTaskId}
          targetDomains={selectedTask.target_domains}
          targetStudentIds={selectedTask.target_student_ids}
        />
      </div>
    )
  }

  return <SubmissionsTaskList tasks={tasks} isLoading={isLoading} onSelect={setSelectedTaskId} />
}
