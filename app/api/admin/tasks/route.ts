import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api/require-admin'
import { notifyStudentsByDomains } from '@/lib/notifications/notify-students'
import { toDbTargetDomains, toDbTargetStudentIds } from '@/utils/meeting-audience'

export async function POST(request: Request) {
  const auth = await requirePermission('tasks')
  if ('error' in auth && auth.error) return auth.error

  const body = await request.json()
  const { title, description, assignedBy, dueDate, targetDomains, targetStudentIds } = body

  if (!title || !dueDate || !assignedBy) {
    return NextResponse.json(
      { message: 'Title, assigned by, and due date are required' },
      { status: 400 }
    )
  }

  const domains = toDbTargetDomains(
    Array.isArray(targetDomains) ? (targetDomains as string[]) : undefined
  )
  const studentIds = toDbTargetStudentIds(
    Array.isArray(targetStudentIds) ? (targetStudentIds as string[]) : undefined
  )

  const { data, error } = await auth.supabase
    .from('tasks')
    .insert({
      title,
      description: description || null,
      assigned_by: assignedBy,
      due_date: dueDate,
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
    title: `New task: ${title}`,
    body: `Due ${dueDate} · Assigned by ${assignedBy}`,
    type: 'task',
  })

  return NextResponse.json(data, { status: 201 })
}
