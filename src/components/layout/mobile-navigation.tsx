'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import { SidebarNavigation } from './sidebar-navigation'
import { UserMenu } from './user-menu'

export interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string | null
  userName?: string | null
  avatarUrl?: string | null
}

export function MobileNavigation({
  isOpen,
  onClose,
  userEmail,
  userName,
  avatarUrl,
}: MobileNavigationProps) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      side="left"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#E8E1F4] border border-[#D8CEE8] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#352749]" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#33312F]">
            Notepad<span className="text-[#85817D] font-normal">.ai</span>
          </span>
        </div>
      }
      footer={
        <UserMenu
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
        />
      }
    >
      <div className="py-2">
        <div className="px-3 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85817D]">
            Personal Workspace
          </span>
        </div>
        <SidebarNavigation onItemClick={onClose} />
      </div>
    </Sheet>
  )
}
