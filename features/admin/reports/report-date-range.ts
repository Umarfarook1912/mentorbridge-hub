/** YYYY-MM for the current calendar month. */
export function currentMonthValue(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Inclusive start/end dates for a from–to month range (YYYY-MM). */
export function monthRangeBounds(fromMonth: string, toMonth: string): { start: string; end: string } {
  const [from, to] = fromMonth <= toMonth ? [fromMonth, toMonth] : [toMonth, fromMonth]
  const [y1, m1] = from.split('-').map(Number)
  const [y2, m2] = to.split('-').map(Number)
  const start = `${y1}-${String(m1).padStart(2, '0')}-01`
  const end = new Date(y2, m2, 0).toISOString().split('T')[0]
  return { start, end }
}

export function reportPeriodLabel(fullReport: boolean, fromMonth: string, toMonth: string): string {
  if (fullReport) return 'full'
  if (fromMonth === toMonth) return fromMonth
  return `${fromMonth}_to_${toMonth}`
}
