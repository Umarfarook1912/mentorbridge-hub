/** Local calendar date as YYYY-MM-DD */
export function localToday(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** True only after the due calendar day is fully over (due date itself is not overdue). */
export function isTaskOverdue(dueDate: string): boolean {
  const dateOnly = dueDate.slice(0, 10)
  return dateOnly < localToday()
}

/** True once the meeting's end time has passed (or the date is before today). */
export function isMeetingCompleted(meetingDate: string, endTime: string): boolean {
  const today = localToday()
  if (meetingDate < today) return true
  if (meetingDate > today) return false

  const [h = 0, m = 0] = endTime.split(':').map(Number)
  const end = new Date()
  end.setHours(h, m, 0, 0)
  return Date.now() >= end.getTime()
}
