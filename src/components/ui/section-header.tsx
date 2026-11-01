import React from 'react'
import { cn } from '@/lib/utils/styling'

export interface SectionHeaderProps {
  title: string
  description?: string
  badge?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  badge,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#33312F]">
            {title}
          </h2>
          {badge && <div>{badge}</div>}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-[#85817D] mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

