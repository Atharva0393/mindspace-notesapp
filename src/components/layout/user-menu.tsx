'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, LogOut, Command, User as UserIcon } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { signOut } from '@/app/(auth)/actions'

export interface UserMenuProps {
  userEmail?: string | null
  userName?: string | null
  avatarUrl?: string | null
}

export function UserMenu({
  userEmail = 'alex@example.com',
  userName = 'Alex Morgan',
  avatarUrl,
}: UserMenuProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const items: (DropdownMenuItem | 'divider')[] = [
    {
      id: 'profile-info',
      label: userName || 'User Account',
      icon: <UserIcon className="w-3.5 h-3.5 text-[#85817D]" />,
      onClick: () => router.push('/app/settings'),
    },
    'divider',
    {
      id: 'settings',
      label: 'Workspace Settings',
      icon: <Settings className="w-3.5 h-3.5 text-[#85817D]" />,
      shortcut: '⌘,',
      onClick: () => router.push('/app/settings'),
    },
    {
      id: 'shortcuts',
      label: 'Command Palette',
      icon: <Command className="w-3.5 h-3.5 text-[#85817D]" />,
      shortcut: '⌘K',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('open-command-palette'))
      },
    },
    'divider',
    {
      id: 'logout',
      label: isPending ? 'Signing out...' : 'Sign Out',
      icon: <LogOut className="w-3.5 h-3.5 text-[#A8382B]" />,
      destructive: true,
      onClick: () => {
        startTransition(async () => {
          await signOut()
        })
      },
    },
  ]

  const trigger = (
    <div className="flex items-center gap-2.5 p-1 rounded-[10px] hover:bg-[#F5F2EB] transition-colors cursor-pointer select-none">
      <Avatar src={avatarUrl} name={userName || userEmail || 'User'} size="sm" />
      <div className="hidden md:flex flex-col text-left">
        <span className="text-xs font-semibold text-[#33312F] truncate max-w-[110px]">
          {userName || 'Personal'}
        </span>
        <span className="text-[10px] text-[#85817D] truncate max-w-[110px]">
          {userEmail || 'offline@workspace'}
        </span>
      </div>
    </div>
  )

  return <DropdownMenu trigger={trigger} items={items} align="right" />
}

