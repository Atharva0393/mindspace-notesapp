'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { SidebarNavigation } from './sidebar-navigation'
import { UserMenu } from './user-menu'
import { Tooltip } from '@/components/ui/tooltip'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils/styling'

export interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  userEmail?: string | null
  userName?: string | null
  avatarUrl?: string | null
  className?: string
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  userEmail,
  userName,
  avatarUrl,
  className,
}: SidebarProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  return (
    <>
      <aside
        className={cn(
          'h-screen bg-[#FAF9F6] border-r border-[#EAE6DF] flex flex-col justify-between transition-all duration-200 select-none z-30 shrink-0',
          isCollapsed ? 'w-[68px]' : 'w-[240px]',
          className
        )}
      >
        {/* Top: Brand & Workspace Identity */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#EAE6DF]">
            <Link
              href="/app"
              className={cn(
                'flex items-center gap-2.5 transition-transform active:scale-95 overflow-hidden',
                isCollapsed && 'justify-center mx-auto'
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-[#E8E1F4] border border-[#D8CEE8] flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-4 h-4 text-[#352749]" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-bold text-sm tracking-tight text-[#33312F]">
                    Notepad<span className="text-[#85817D] font-normal">.ai</span>
                  </span>
                  <span className="text-[10px] text-[#85817D] truncate">
                    Personal Workspace
                  </span>
                </div>
              )}
            </Link>

            {onToggleCollapse && !isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-[8px] text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Collapsed expand toggle button */}
          {onToggleCollapse && isCollapsed && (
            <div className="pt-3 pb-1 flex justify-center">
              <Tooltip content="Expand sidebar" position="right">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="p-2 rounded-[8px] text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          )}

          {/* Main Navigation */}
          <div className="py-4 overflow-y-auto max-h-[calc(100vh-210px)]">
            <SidebarNavigation isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Bottom Section: Settings, Help & User Menu */}
        <div className="p-3 border-t border-[#EAE6DF] flex flex-col gap-1">
          {/* Settings */}
          {isCollapsed ? (
            <Tooltip content="Settings" position="right">
              <Link
                href="/app/settings"
                className="h-9 w-9 rounded-[10px] flex items-center justify-center mx-auto text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </Tooltip>
          ) : (
            <Link
              href="/app/settings"
              className="h-9 px-2.5 rounded-[10px] flex items-center gap-2.5 text-xs font-medium text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Workspace Settings</span>
            </Link>
          )}

          {/* Help & Support */}
          {isCollapsed ? (
            <Tooltip content="Help & Roadmap" position="right">
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="h-9 w-9 rounded-[10px] flex items-center justify-center mx-auto text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="h-9 px-2.5 rounded-[10px] flex items-center gap-2.5 text-xs font-medium text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors cursor-pointer text-left w-full"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Help &amp; Roadmap</span>
            </button>
          )}

          <div className="my-1 border-t border-[#EAE6DF]" />

          {/* User Profile dropdown */}
          <div className={cn(isCollapsed && 'flex justify-center')}>
            <UserMenu
              userEmail={userEmail}
              userName={userName}
              avatarUrl={avatarUrl}
            />
          </div>
        </div>
      </aside>

      {/* Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Workspace Overview & Roadmap"
        description="Notepad.ai combines pastel sticky notes, habit tracking, and Gemini AI."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-[14px] bg-[#E8E1F4] border border-[#D8CEE8] text-xs text-[#352749]">
            <span className="font-semibold">Current Phase:</span> Phase 02 (Pastel Design System &amp; Workspace Shell) is active. All components and navigation are functional.
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#85817D]">
              Next Milestones
            </h4>
            <ul className="text-xs space-y-1.5 text-[#4A4744]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B54F]" />
                <strong>Phase 03:</strong> Intelligent Notes &amp; Interactive Sticky Board
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D7535]" />
                <strong>Phase 04:</strong> Tasks, Habits &amp; Daily Planner Timeline
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B3E8C]" />
                <strong>Phase 05:</strong> Mindful Journaling &amp; Mood Reflection
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#213545]" />
                <strong>Phase 06 &amp; 07:</strong> Gemini RAG Knowledge Engine &amp; AI Copilot
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}

