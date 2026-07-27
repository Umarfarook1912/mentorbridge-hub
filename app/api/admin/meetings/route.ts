import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const body = await request.json()
  const { title, description, handledBy, meetingDate, startTime, endTime, meetUrl } = body

  if (!title || !handledBy || !meetingDate || !startTime || !endTime) {
    return NextResponse.json({ message: 'Missing required meeting fields' }, { status: 400 })
  }

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
      created_by: auth.user.id,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
