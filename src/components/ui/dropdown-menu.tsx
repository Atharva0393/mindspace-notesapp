'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/styling'

export interface DropdownMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
}

export interface DropdownMenuProps {
  trigger: React.ReactNode
  items: (DropdownMenuItem | 'divider')[]
  align?: 'left' | 'right'
  className?: string
}

export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={cn(
              'absolute top-full mt-1.5 z-50 min-w-[190px] p-1.5 bg-white border border-[#EAE6DF] rounded-[14px] shadow-lg select-none',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {items.map((item, index) => {
              if (item === 'divider') {
                return (
                  <div
                    key={`div-${index}`}
                    className="my-1 border-t border-[#EAE6DF]"
                  />
                )
              }

              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled && item.onClick) {
                      item.onClick()
                      setIsOpen(false)
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-[9px] text-xs font-medium transition-colors text-left cursor-pointer',
                    item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                    item.destructive
                      ? 'text-[#A8382B] hover:bg-[#F7DFD8]'
                      : 'text-[#33312F] hover:bg-[#F5F2EB]'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className="text-[10px] text-[#85817D] ml-2 font-normal">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

