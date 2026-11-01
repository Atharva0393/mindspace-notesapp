import React from 'react'
import { PastelColorKey, PASTEL_PALETTE } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/styling'

export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  color?: PastelColorKey
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  color = 'lavender',
  className,
}: EmptyStateProps) {
  const palette = PASTEL_PALETTE[color] || PASTEL_PALETTE.lavender

  return (
    <div
      className={cn(
        'w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center',
        className
      )}
    >
      {/* Icon with pastel background */}
      <div
        className={cn(
          'w-14 h-14 rounded-[16px] border flex items-center justify-center mb-4 shadow-xs',
          palette.bgClass,
          palette.borderClass,
          palette.textClass
        )}
      >
        {icon}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#33312F] tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#85817D] mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

