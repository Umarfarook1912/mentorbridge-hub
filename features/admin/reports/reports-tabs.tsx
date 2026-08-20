'use client'

import { useState } from 'react'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { AttendanceReport } from './attendance-report'
import { TaskCompletionReport } from './task-completion-report'

type ReportTab = 'attendance' | 'tasks'

export function ReportsTabs() {
  const [tab, setTab] = useState<ReportTab>('attendance')

  return (
    <div className="space-y-4">
      <FilterPills
        aria-label="Report type"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'attendance', label: 'Attendance' },
          { value: 'tasks', label: 'Task Completion' },
        ]}
      />

      {tab === 'attendance' ? <AttendanceReport /> : <TaskCompletionReport />}
    </div>
  )
}
