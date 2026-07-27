import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const { title, description, handledBy, meetingDate, startTime, endTime, meetUrl } = body

  if (!title || !handledBy || !meetingDate || !startTime || !endTime) {
    return NextResponse.json({ message: 'Missing required meeting fields' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('meetings')
    .update({
      title,
      description: description || null,
      handled_by: handledBy,
      meeting_date: meetingDate,
      start_time: startTime,
      end_time: endTime,
      meet_url: meetUrl || null,
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  if (!data) {
    return NextResponse.json(
      { message: 'Meeting not found or update not allowed' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const { error } = await auth.supabase.from('meetings').delete().eq('id', id)

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
