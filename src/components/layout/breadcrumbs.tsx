'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  app: 'Home',
  notes: 'Intelligent Notes',
  habits: 'Habits & Streaks',
  tasks: 'Tasks',
  goals: 'Goals',
  calendar: 'Daily Planner',
  journal: 'Mindful Journal',
  ai: 'Gemini Companion',
  insights: 'Workspace Insights',
  settings: 'Settings',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // If on /app or root, show simple current space
  if (segments.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#33312F]">
        <span>Workspace Overview</span>
      </div>
    )
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
      <Link
        href="/app"
        className="text-[#85817D] hover:text-[#33312F] transition-colors flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {segments.slice(1).map((seg, index) => {
        const isLast = index === segments.length - 2
        const href = `/${segments.slice(0, index + 2).join('/')}`
        const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3 h-3 text-[#AFAAA4] shrink-0" />
            {isLast ? (
              <span className="font-semibold text-[#33312F] truncate">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-[#85817D] hover:text-[#33312F] transition-colors truncate"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

