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
                    Mindspace<span className="text-[#85817D] font-normal">.ai</span>
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
              <span>Shortcuts &amp; Guide</span>
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

      {/* Help & Guide Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Mindspace Guide & Shortcuts"
        description="Pastel tactile surfaces, habit tracking, mindful reflection, and Gemini AI."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-[14px] bg-[#E3EBDD] border border-[#CCD9C3] text-xs text-[#283824] flex items-center justify-between">
            <span className="font-semibold">MINDSPACE Cloud Engine Active</span>
            <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded-full font-mono">v1.2 Production</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#85817D]">
              Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E8E6DF] flex items-center justify-between">
                <span className="text-[#55524E]">Command Palette</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D5D1C8] text-[10px] font-mono shadow-3xs">⌘K</kbd>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E8E6DF] flex items-center justify-between">
                <span className="text-[#55524E]">Quick Note</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D5D1C8] text-[10px] font-mono shadow-3xs">⌘N</kbd>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E8E6DF] flex items-center justify-between">
                <span className="text-[#55524E]">Search Workspace</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D5D1C8] text-[10px] font-mono shadow-3xs">⌘F</kbd>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E8E6DF] flex items-center justify-between">
                <span className="text-[#55524E]">Dismiss / Close</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D5D1C8] text-[10px] font-mono shadow-3xs">Esc</kbd>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#85817D]">
              Workspace Modules
            </h4>
            <ul className="text-xs space-y-1.5 text-[#4A4744]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B54F]" />
                <strong>Intelligent Notes:</strong> Tactile sticky notes with rich Markdown &amp; color tags.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D7535]" />
                <strong>Habit Studio &amp; Tasks:</strong> Daily consistency heatmaps, streaks, and Eisenhower matrix.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B3E8C]" />
                <strong>Mindful Journal:</strong> Mood logging, reflection prompts, and emotional analytics.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#213545]" />
                <strong>Gemini Copilot:</strong> Retrieval-Augmented Generation across your entire personal corpus.
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}

