import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const body = await request.json()
  const { title, description, dueDate, department } = body

  if (!title || !dueDate) {
    return NextResponse.json({ message: 'Title and due date are required' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('tasks')
    .insert({
      title,
      description: description || null,
      due_date: dueDate,
      department: !department || department === 'all' ? null : department,
      created_by: auth.user.id,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
