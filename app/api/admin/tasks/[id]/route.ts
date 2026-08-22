import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/api/require-admin'
import { toDbTargetDomains, toDbTargetStudentIds } from '@/utils/meeting-audience'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission('tasks')
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
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
    .update({
      title,
      description: description || null,
      assigned_by: assignedBy,
      due_date: dueDate,
      target_domains: domains,
      target_student_ids: studentIds,
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  if (!data) {
    return NextResponse.json({ message: 'Task not found or update not allowed' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission('tasks')
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const { error } = await auth.supabase.from('tasks').delete().eq('id', id)

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
