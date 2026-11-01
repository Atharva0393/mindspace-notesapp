'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  StickyNote,
  Flame,
  CheckSquare,
  Target,
  Calendar,
  BookOpen,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/styling'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  color?: string
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home Desk',
    href: '/app',
    icon: <Home className="w-4 h-4" />,
  },
  {
    id: 'notes',
    label: 'Intelligent Notes',
    href: '/app/notes',
    icon: <StickyNote className="w-4 h-4 text-[#946A1E]" />,
  },
  {
    id: 'habits',
    label: 'Habits & Streaks',
    href: '/app/habits',
    icon: <Flame className="w-4 h-4 text-[#A84232]" />,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/app/tasks',
    icon: <CheckSquare className="w-4 h-4 text-[#2E6826]" />,
  },
  {
    id: 'goals',
    label: 'Goals',
    href: '/app/goals',
    icon: <Target className="w-4 h-4 text-[#1E3345]" />,
  },
  {
    id: 'calendar',
    label: 'Daily Planner',
    href: '/app/calendar',
    icon: <Calendar className="w-4 h-4 text-[#1E3345]" />,
  },
  {
    id: 'journal',
    label: 'Mindful Journal',
    href: '/app/journal',
    icon: <BookOpen className="w-4 h-4 text-[#4D327B]" />,
  },
  {
    id: 'ai',
    label: 'AI Companion',
    href: '/app/ai',
    icon: <Sparkles className="w-4 h-4 text-[#5B3E8C]" />,
    badge: 'Gemini',
  },
  {
    id: 'insights',
    label: 'Insights',
    href: '/app/insights',
    icon: <BarChart3 className="w-4 h-4 text-[#85817D]" />,
  },
]

export function SidebarNavigation({
  isCollapsed = false,
  onItemClick,
}: {
  isCollapsed?: boolean
  onItemClick?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-2.5">
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === '/app'
            ? pathname === '/app'
            : pathname.startsWith(item.href)

        const linkContent = (
          <Link
            key={item.id}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'group flex items-center rounded-[12px] text-xs font-medium transition-all select-none',
              isCollapsed
                ? 'h-10 w-10 justify-center mx-auto'
                : 'h-9 px-3 justify-between',
              isActive
                ? 'bg-white text-[#33312F] shadow-xs border border-[#EAE6DF] font-semibold'
                : 'text-[#5C5956] hover:bg-[#F5F2EB] hover:text-[#33312F]'
            )}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className={cn('shrink-0 transition-transform group-hover:scale-105', isActive && 'text-[#33312F]')}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </div>

            {!isCollapsed && item.badge && (
              <span className="px-1.5 py-0.5 rounded-[5px] bg-[#E8E1F4] text-[#352749] text-[10px] font-medium border border-[#D8CEE8] shrink-0">
                {item.badge}
              </span>
            )}
          </Link>
        )

        if (isCollapsed) {
          return (
            <Tooltip key={item.id} content={item.label} position="right">
              {linkContent}
            </Tooltip>
          )
        }

        return linkContent
      })}
    </nav>
  )
}

