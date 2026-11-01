'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/styling'

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  side?: 'right' | 'left'
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Sheet({
  isOpen,
  onClose,
  side = 'right',
  title,
  description,
  children,
  footer,
  className,
}: SheetProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const isRight = side === 'right'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#33312F]/20 backdrop-blur-xs"
          />

          <div
            className={cn(
              'fixed inset-y-0 flex max-w-full pointer-events-none',
              isRight ? 'right-0' : 'left-0'
            )}
          >
            <motion.div
              initial={{ x: isRight ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRight ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className={cn(
                'pointer-events-auto w-screen max-w-md bg-white border-x border-[#EAE6DF] shadow-2xl flex flex-col',
                className
              )}
            >
              {/* Header */}
              <div className="p-6 border-b border-[#EAE6DF] flex items-start justify-between gap-4">
                <div>
                  {title && (
                    <h2 className="text-base sm:text-lg font-bold text-[#33312F] tracking-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-xs sm:text-sm text-[#85817D] mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-[8px] text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="p-4 border-t border-[#EAE6DF] bg-[#FAF9F6]">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

