import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api/require-admin'
import { notifyStudentsByDomains } from '@/lib/notifications/notify-students'
import { toDbTargetDomains, toDbTargetStudentIds } from '@/utils/meeting-audience'

export async function POST(request: Request) {
  const auth = await requirePermission('meetings')
  if ('error' in auth && auth.error) return auth.error

  const body = await request.json()
  const {
    title,
    description,
    handledBy,
    meetingDate,
    startTime,
    endTime,
    meetUrl,
    attendanceMandatory,
    targetDomains,
    targetStudentIds,
  } = body

  if (!title || !handledBy || !meetingDate || !startTime || !endTime) {
    return NextResponse.json({ message: 'Missing required meeting fields' }, { status: 400 })
  }

  const domains = toDbTargetDomains(
    Array.isArray(targetDomains) ? (targetDomains as string[]) : undefined
  )
  const studentIds = toDbTargetStudentIds(
    Array.isArray(targetStudentIds) ? (targetStudentIds as string[]) : undefined
  )

  const { data, error } = await auth.supabase
    .from('meetings')
    .insert({
      title,
      description: description || null,
      handled_by: handledBy,
      meeting_date: meetingDate,
      start_time: startTime,
      end_time: endTime,
      meet_url: meetUrl || null,
      attendance_mandatory: attendanceMandatory !== false,
      target_domains: domains,
      target_student_ids: studentIds,
      created_by: auth.user.id,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })

  await notifyStudentsByDomains({
    targetDomains: domains,
    targetStudentIds: studentIds,
    title: `New meeting: ${title}`,
    body: `${meetingDate} · ${startTime}–${endTime} · ${handledBy}`,
    type: 'meeting',
  })

  return NextResponse.json(data, { status: 201 })
}
