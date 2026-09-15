import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/api/require-admin'
import { studentNoteSchema } from '@/lib/validations/student-note'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id: studentId } = await params

  const { data, error } = await auth.supabase
    .from('student_notes')
    .select(
      'id, student_id, author_id, body, category, created_at, updated_at, author:author_id(full_name)'
    )
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id: studentId } = await params
  const parsed = studentNoteSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid note' },
      { status: 400 }
    )
  }

  const { data, error } = await auth.supabase
    .from('student_notes')
    .insert({
      student_id: studentId,
      author_id: auth.user.id,
      body: parsed.data.body,
      category: parsed.data.category,
    })
    .select(
      'id, student_id, author_id, body, category, created_at, updated_at, author:author_id(full_name)'
    )
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
