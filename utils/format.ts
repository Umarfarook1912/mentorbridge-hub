import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { isMeetingCompleted } from '@/utils/meeting-time'

export function formatDate(dateStr: string, pattern = 'dd MMM yyyy') {
  try {
    return format(parseISO(dateStr), pattern)
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, h:mm a')
  } catch {
    return dateStr
  }
}

export function formatTime(timeStr: string) {
  try {
    const [h, m] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(h, m, 0, 0)
    return format(date, 'h:mm a')
  } catch {
    return timeStr
  }
}

export function formatRelative(dateStr: string) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

export function getMeetingLabel(
  dateStr: string,
  endTime?: string
): 'today' | 'tomorrow' | 'upcoming' | 'past' {
  try {
    if (endTime && isMeetingCompleted(dateStr, endTime)) return 'past'
    const date = parseISO(dateStr)
    if (isToday(date)) return 'today'
    if (isTomorrow(date)) return 'tomorrow'
    if (isPast(date)) return 'past'
    return 'upcoming'
  } catch {
    return 'upcoming'
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
