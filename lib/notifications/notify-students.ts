import { getSupabaseAdminClient } from '@/lib/supabase/server'

interface NotifyStudentsParams {
  targetDomains: string[] | null
  targetStudentIds: string[] | null
  title: string
  body: string
  type: 'meeting' | 'task' | 'submission'
}

/**
 * Fan-out in-app notifications.
 * Both empty = all students; else domain OR explicit student ids (union).
 * Fail soft — callers should not fail the primary action if this errors.
 */
export async function notifyStudentsByDomains({
  targetDomains,
  targetStudentIds,
  title,
  body,
  type,
}: NotifyStudentsParams): Promise<void> {
  try {
    const admin = await getSupabaseAdminClient()
    const domains = targetDomains ?? []
    const ids = targetStudentIds ?? []
    const recipientIds = new Set<string>()

    if (domains.length === 0 && ids.length === 0) {
      const { data } = await admin.from('profiles').select('id').eq('role', 'Student')
      data?.forEach((s) => recipientIds.add(s.id))
    } else {
      if (domains.length > 0) {
        const { data } = await admin
          .from('profiles')
          .select('id')
          .eq('role', 'Student')
          .in('domain_interest', domains)
        data?.forEach((s) => recipientIds.add(s.id))
      }
      ids.forEach((id) => recipientIds.add(id))
    }

    if (!recipientIds.size) return

    const rows = [...recipientIds].map((user_id) => ({
      user_id,
      title,
      body,
      type,
      is_read: false,
    }))

    await admin.from('notifications').insert(rows)
  } catch {
    // Soft-fail: meeting create should still succeed
  }
}
