'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Ban, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { ROUTES } from '@/lib/constants'
import { ACCOUNT_INACTIVE_MESSAGE } from '@/lib/account-status'

export function AccountInactiveView() {
  const clearUser = useAuthStore((s) => s.clearUser)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    async function signOutInactive() {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      clearUser()
      if (mounted) setReady(true)
    }
    void signOutInactive()
    return () => {
      mounted = false
    }
  }, [clearUser])

  return (
    <div className="space-y-4 text-center">
      <div className="bg-destructive/10 text-destructive mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <Ban className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Account inactive</h1>
        <p className="text-muted-foreground text-sm">{ACCOUNT_INACTIVE_MESSAGE}</p>
      </div>
      {ready ? (
        <Button nativeButton={false} render={<Link href={ROUTES.login} />} className="w-full">
          Back to sign in
        </Button>
      ) : (
        <Button className="w-full" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out…
        </Button>
      )}
    </div>
  )
}
