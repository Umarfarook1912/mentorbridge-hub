'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'

export interface Notification {
  id: string
  title: string
  body: string | null
  type: string
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const supabase = getSupabaseBrowserClient()

  const query = useQuery({
    queryKey: [QUERY_KEYS.notifications, user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return (data ?? []) as Notification[]
    },
    enabled: !!user,
    staleTime: STALE_TIME.short,
  })

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          toast.info(notification.title, { description: notification.body ?? undefined })
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications, user.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  async function markAllRead() {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications, user.id] })
  }

  const unreadCount = query.data?.filter((n) => !n.is_read).length ?? 0

  return { ...query, unreadCount, markAllRead }
}
