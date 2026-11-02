'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Plus, Bell, StickyNote, CheckSquare, Flame, Sparkles, BookOpen } from 'lucide-react'
import { Breadcrumbs } from './breadcrumbs'
import { GlobalSearch } from './global-search'
import { UserMenu } from './user-menu'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Popover } from '@/components/ui/popover'

export interface WorkspaceHeaderProps {
  onOpenMobileNav: () => void
  userEmail?: string | null
  userName?: string | null
  avatarUrl?: string | null
}

export function WorkspaceHeader({
  onOpenMobileNav,
  userEmail,
  userName,
  avatarUrl,
}: WorkspaceHeaderProps) {
  const router = useRouter()

  const quickCreateItems: (DropdownMenuItem | 'divider')[] = [
    {
      id: 'create-note',
      label: 'New Sticky Note',
      icon: <StickyNote className="w-4 h-4 text-[#B58525]" />,
      shortcut: 'N',
      onClick: () => {
        router.push('/app/notes?action=new')
      },
    },
    {
      id: 'create-task',
      label: 'New Task',
      icon: <CheckSquare className="w-4 h-4 text-[#3D7535]" />,
      shortcut: 'T',
      onClick: () => {
        router.push('/app/tasks?action=new')
      },
    },
    {
      id: 'create-habit',
      label: 'New Habit',
      icon: <Flame className="w-4 h-4 text-[#C95D4A]" />,
      shortcut: 'H',
      onClick: () => {
        router.push('/app/habits?action=new')
      },
    },
    {
      id: 'create-journal',
      label: 'New Journal Entry',
      icon: <BookOpen className="w-4 h-4 text-[#7A281E]" />,
      shortcut: 'J',
      onClick: () => {
        router.push('/app/journal?action=new')
      },
    },
    {
      id: 'ask-ai',
      label: 'Ask Gemini Copilot',
      icon: <Sparkles className="w-4 h-4 text-[#5B3E8C]" />,
      shortcut: 'A',
      onClick: () => {
        router.push('/app/ai')
      },
    },
  ]

  const quickCreateTrigger = (
    <button
      type="button"
      className="h-9 px-3 rounded-[11px] bg-[#33312F] text-[#FAF9F6] text-xs font-medium hover:bg-[#1F1E1D] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
      aria-label="Quick create"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">New</span>
    </button>
  )

  const notificationsContent = (
    <div className="w-72">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EAE6DF]">
        <h4 className="text-xs font-bold text-[#33312F]">Notifications</h4>
        <span className="text-[10px] text-[#85817D]">All caught up</span>
      </div>
      <div className="py-4 text-center">
        <div className="w-9 h-9 rounded-full bg-[#E8E1F4] text-[#352749] flex items-center justify-center mx-auto mb-2">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-[#33312F]">No pending alerts</p>
        <p className="text-[11px] text-[#85817D] mt-0.5">
          Your daily reminders and Gemini briefs will show here.
        </p>
      </div>
    </div>
  )

  return (
    <header className="h-16 border-b border-[#EAE6DF] bg-[#FAF9F6]/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-[9px] text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumbs />
      </div>

      {/* Right: Search, Quick create, Notifications, User */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <GlobalSearch />

        <DropdownMenu trigger={quickCreateTrigger} items={quickCreateItems} align="right" />

        {/* Notifications Popover */}
        <Popover
          trigger={
            <div className="relative p-2 rounded-[10px] text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C95D4A]" />
            </div>
          }
          content={notificationsContent}
          align="end"
        />

        <div className="hidden sm:block border-l border-[#EAE6DF] h-5 mx-0.5" />

        <div className="hidden sm:block">
          <UserMenu
            userEmail={userEmail}
            userName={userName}
            avatarUrl={avatarUrl}
          />
        </div>
      </div>
    </header>
  )
}

