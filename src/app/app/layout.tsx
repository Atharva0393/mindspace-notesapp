import React from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userEmail: string | null = null
  let userName: string | null = null
  let avatarUrl: string | null = null

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        userEmail = data.user.email ?? null
        userName = (data.user.user_metadata?.full_name as string) ?? null
        avatarUrl = (data.user.user_metadata?.avatar_url as string) ?? null
      }
    } catch {
      // Offline / development fallback
    }
  }

  return (
    <AppShell
      userEmail={userEmail}
      userName={userName}
      avatarUrl={avatarUrl}
    >
      {children}
    </AppShell>
  )
}

