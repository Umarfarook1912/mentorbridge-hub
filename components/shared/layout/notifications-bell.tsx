'use client'

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/hooks/use-notifications'
import { formatRelative } from '@/utils/format'
import { cn } from '@/utils/cn'

export function NotificationsBell() {
  const { data: notifications = [], unreadCount, markAllRead } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:bg-muted relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg outline-none">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-primary text-xs hover:underline">
                Mark all read
              </button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex flex-col gap-0.5 border-b px-3 py-2.5 transition-colors last:border-0',
                  !n.is_read && 'bg-primary/5'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-tight font-medium">{n.title}</p>
                  {!n.is_read && (
                    <span className="bg-primary mt-0.5 h-2 w-2 shrink-0 rounded-full" />
                  )}
                </div>
                {n.body && <p className="text-muted-foreground text-xs">{n.body}</p>}
                <p className="text-muted-foreground/60 text-xs">{formatRelative(n.created_at)}</p>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
