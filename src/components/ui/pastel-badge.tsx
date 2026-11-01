import React from 'react'
import { PastelColorKey, PASTEL_PALETTE } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/styling'

export type BadgeVariant = PastelColorKey | 'neutral'
export type BadgeSize = 'sm' | 'md'

export interface PastelBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export function PastelBadge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className,
  children,
  ...props
}: PastelBadgeProps) {
  let bgClass = 'bg-[#F5F2EB]'
  let textClass = 'text-[#33312F]'
  let borderClass = 'border-[#EAE6DF]'
  let dotColor = '#85817D'

  if (variant !== 'neutral' && PASTEL_PALETTE[variant]) {
    const p = PASTEL_PALETTE[variant]
    bgClass = p.badgeBg
    textClass = p.textClass
    borderClass = p.borderClass
    dotColor = p.hex
  }

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5 rounded-[6px] gap-1',
    md: 'text-[11px] px-2.5 py-1 rounded-[8px] gap-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border border-black/[0.04] select-none shrink-0',
        sizeStyles[size],
        bgClass,
        textClass,
        borderClass,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  )
}

