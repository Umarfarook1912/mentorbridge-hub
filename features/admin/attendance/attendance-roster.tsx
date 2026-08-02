'use client'

import { useState, useMemo } from 'react'
import { Save, CheckSquare, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { useGetAttendanceByMeeting } from '@/services/attendance/use-get-attendance'
import { useMarkAttendance } from '@/services/attendance/use-mark-attendance'
import { exportToCSV } from '@/utils/export'
import { isMeetingForStudent } from '@/utils/meeting-audience'
import type { AttendanceStatus } from '@/types/supabase.types'
import { Users } from 'lucide-react'

const STATUS_BUTTONS: { status: AttendanceStatus; label: string; className: string }[] = [
  {
    status: 'Present',
    label: 'P',
    className: 'bg-success/10 text-success hover:bg-success/20 border-success/30',
  },
  {
    status: 'Absent',
    label: 'A',
    className: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30',
  },
  {
    status: 'Permission',
    label: 'Ex',
    className: 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/30',
  },
]

interface AttendanceRosterProps {
  meetingId: string
  meetingTitle: string
  meetingDate: string
  targetDomains?: string[] | null
  targetStudentIds?: string[] | null
}

export function AttendanceRoster({
  meetingId,
  meetingTitle,
  meetingDate,
  targetDomains,
  targetStudentIds,
}: AttendanceRosterProps) {
  const { data: allStudents = [], isLoading: loadingStudents } = useGetAllStudents()
  const { data: existing = [], isLoading: loadingAttendance } = useGetAttendanceByMeeting(meetingId)
  const { mutateAsync: markAttendance, isPending: saving } = useMarkAttendance()

  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({})

  const students = useMemo(
    () =>
      allStudents.filter((s) =>
        isMeetingForStudent(
          { targetDomains, targetStudentIds },
          { id: s.id, domainInterest: s.domain_interest }
        )
      ),
    [allStudents, targetDomains, targetStudentIds]
  )

  const existingMap = useMemo(
    () => Object.fromEntries(existing.map((a) => [a.student_id, a.status as AttendanceStatus])),
    [existing]
  )

  function getStatus(studentId: string): AttendanceStatus {
    return overrides[studentId] ?? existingMap[studentId] ?? 'Absent'
  }

  function setStatus(studentId: string, status: AttendanceStatus) {
    setOverrides((prev) => ({ ...prev, [studentId]: status }))
  }

  function markAllPresent() {
    const all = Object.fromEntries(students.map((s) => [s.id, 'Present' as AttendanceStatus]))
    setOverrides(all)
  }

  async function handleSave() {
    const records = students.map((s) => ({ studentId: s.id, status: getStatus(s.id) }))
    try {
      await markAttendance({ meetingId, records })
      toast.success('Attendance saved')
    } catch {
      toast.error('Failed to save attendance')
    }
  }

  function handleExport() {
    const rows = students.map((s) => ({
      Name: s.full_name,
      Email: s.email,
      Department: s.department ?? '',
      Status: getStatus(s.id),
      Date: meetingDate,
      Meeting: meetingTitle,
    }))
    exportToCSV(rows, `attendance-${meetingTitle}-${meetingDate}`)
  }

  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, Permission: 0 }
    students.forEach((s) => {
      const status = overrides[s.id] ?? existingMap[s.id] ?? 'Absent'
      counts[status]++
    })
    return counts
  }, [students, overrides, existingMap])

  if (loadingStudents || loadingAttendance) return <LoadingSkeleton />

  if (!students.length) {
    return (
      <EmptyState
        icon={Users}
        title="No students for this audience"
        description="No enrolled students match this meeting’s domains"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-success font-medium">Present: {summary.Present}</span>
          <span className="text-destructive font-medium">Absent: {summary.Absent}</span>
          <span className="text-warning font-medium">Permission: {summary.Permission}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={markAllPresent}>
            <CheckSquare className="mr-1.5 h-3.5 w-3.5" /> Mark All Present
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Roster */}
      <div className="space-y-3">
        {students.map((student) => {
          const current = getStatus(student.id)
          return (
            <FeatureCard key={student.id} contentClassName="space-y-0 py-3" accent="brand">
              <div className="flex items-center gap-4">
                <UserAvatar name={student.full_name} avatarUrl={student.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{student.full_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {student.department ?? student.email}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {STATUS_BUTTONS.map(({ status, label, className }) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatus(student.id, status)}
                      className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-all ${className} ${current === status ? 'opacity-100 ring-2 ring-current ring-offset-1' : 'opacity-60'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </FeatureCard>
          )
        })}
      </div>
    </div>
  )
}
