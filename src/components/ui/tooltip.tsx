'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/styling'

export interface TooltipProps {
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  children: React.ReactNode
  className?: string
}

export function Tooltip({
  content,
  position = 'top',
  delay = 150,
  children,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  function handleMouseEnter() {
    const t = setTimeout(() => setIsVisible(true), delay)
    setTimer(t)
  }

  function handleMouseLeave() {
    if (timer) clearTimeout(timer)
    setIsVisible(false)
  }

  const positions: Record<'top' | 'bottom' | 'left' | 'right', string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute z-50 px-2.5 py-1 text-[11px] font-medium text-[#33312F] bg-white border border-[#EAE6DF] rounded-[8px] shadow-sm whitespace-nowrap pointer-events-none select-none',
              positions[position],
              className
            )}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

