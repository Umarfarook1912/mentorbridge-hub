import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/api/require-admin'
import { studentNoteSchema } from '@/lib/validations/student-note'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const auth = await requireSuperAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id: studentId, noteId } = await params
  const parsed = studentNoteSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid note' },
      { status: 400 }
    )
  }

  const { data, error } = await auth.supabase
    .from('student_notes')
    .update({
      body: parsed.data.body,
      category: parsed.data.category,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .eq('student_id', studentId)
    .select(
      'id, student_id, author_id, body, category, created_at, updated_at, author:author_id(full_name)'
    )
    .maybeSingle()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ message: 'Note not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const auth = await requireSuperAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id: studentId, noteId } = await params

  const { data, error } = await auth.supabase
    .from('student_notes')
    .delete()
    .eq('id', noteId)
    .eq('student_id', studentId)
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ message: 'Note not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
