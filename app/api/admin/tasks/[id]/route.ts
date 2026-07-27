import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const { title, description, dueDate, department } = body

  if (!title || !dueDate) {
    return NextResponse.json({ message: 'Title and due date are required' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('tasks')
    .update({
      title,
      description: description || null,
      due_date: dueDate,
      department: !department || department === 'all' ? null : department,
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
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const { error } = await auth.supabase.from('tasks').delete().eq('id', id)

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
