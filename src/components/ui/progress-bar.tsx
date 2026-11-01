'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PastelColorKey, PASTEL_PALETTE } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/styling'

export interface ProgressBarProps {
  value: number // 0 to 100
  color?: PastelColorKey
  showLabel?: boolean
  label?: string
  className?: string
}

export function ProgressBar({
  value,
  color = 'sage',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const palette = PASTEL_PALETTE[color] || PASTEL_PALETTE.sage

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-medium text-[#85817D] mb-1.5">
          {label && <span>{label}</span>}
          {showLabel && <span>{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-[#EAE6DF]/70 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={cn('h-full rounded-full', palette.bgClass)}
          style={{ backgroundColor: palette.hex }}
        />
      </div>
    </div>
  )
}

