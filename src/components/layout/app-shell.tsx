'use client'

import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { WorkspaceHeader } from './workspace-header'
import { MobileNavigation } from './mobile-navigation'
import { CommandPalette } from './command-palette'
import { ToastProvider } from '@/components/ui/toast'

export interface AppShellProps {
  children: React.ReactNode
  userEmail?: string | null
  userName?: string | null
  avatarUrl?: string | null
}

export function AppShell({
  children,
  userEmail,
  userName,
  avatarUrl,
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FAF9F6] text-[#33312F] flex">
        {/* Desktop Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
          className="hidden md:flex"
        />

        {/* Mobile Navigation Drawer */}
        <MobileNavigation
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          <WorkspaceHeader
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
            userEmail={userEmail}
            userName={userName}
            avatarUrl={avatarUrl}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Global Command Palette */}
        <CommandPalette />
      </div>
    </ToastProvider>
  )
}
