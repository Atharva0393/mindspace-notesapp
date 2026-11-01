'use client'

import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Pin } from 'lucide-react'
import { PastelColorKey, PASTEL_PALETTE } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/styling'

export interface StickyCardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  color?: PastelColorKey
  title?: React.ReactNode
  description?: React.ReactNode
  date?: string
  tags?: string[]
  isPinned?: boolean
  rotation?: 'none' | 'left' | 'right'
  headerAction?: React.ReactNode
  footerAction?: React.ReactNode
  onClick?: () => void
  children?: React.ReactNode
}

export function StickyCard({
  className,
  color = 'ivory',
  title,
  description,
  date,
  tags,
  isPinned = false,
  rotation = 'none',
  headerAction,
  footerAction,
  onClick,
  children,
  ...props
}: StickyCardProps) {
  const palette = PASTEL_PALETTE[color] || PASTEL_PALETTE.ivory

  const rotationClasses = {
    none: 'rotate-0',
    left: '-rotate-[0.8deg]',
    right: 'rotate-[0.8deg]',
  }

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={cn(
        'relative rounded-[18px] border p-5 flex flex-col justify-between transition-shadow',
        'paper-shadow hover:paper-shadow-md',
        palette.bgClass,
        palette.borderClass,
        rotationClasses[rotation],
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {/* Top row: Pin indicator & Header Action */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {isPinned && (
            <Pin className="w-3.5 h-3.5 text-[#85817D] shrink-0 fill-[#85817D]/30" />
          )}
          {typeof title === 'string' ? (
            <h3 className={cn('font-semibold text-sm sm:text-base tracking-tight truncate', palette.textClass)}>
              {title}
            </h3>
          ) : (
            title
          )}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Main Body */}
      <div className="flex-1 my-1">
        {description && (
          <p className="text-xs sm:text-sm text-[#4A4744] leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        )}
        {children}
      </div>

      {/* Footer / Meta: Tags, Date & Footer Actions */}
      {(date || (tags && tags.length > 0) || footerAction) && (
        <div className="pt-3 mt-3 border-t border-black/[0.06] flex items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {date && (
              <span className="text-[11px] text-[#85817D] font-medium mr-1 shrink-0">
                {date}
              </span>
            )}
            {tags &&
              tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-[6px] bg-white/70 backdrop-blur-xs text-[10px] font-medium text-[#444] border border-black/[0.04] shrink-0"
                >
                  #{tag}
                </span>
              ))}
          </div>
          {footerAction && <div className="shrink-0">{footerAction}</div>}
        </div>
      )}
    </motion.div>
  )
}

