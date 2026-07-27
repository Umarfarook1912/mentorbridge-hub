import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'
import { feedbackSchema } from '@/lib/validations/submission'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const parsed = feedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid review data' },
      { status: 400 }
    )
  }

  const { status, feedback } = parsed.data

  const { data, error } = await auth.supabase
    .from('task_submissions')
    .update({
      status,
      feedback,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, status')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  if (!data) {
    return NextResponse.json(
      { message: 'Submission not found or update not allowed' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true, data })
}
