'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/styling'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: React.ReactNode
  id?: string
  className?: string
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  id,
  className,
}: CheckboxProps) {
  const defaultId = React.useId()
  const generatedId = id || defaultId

  return (
    <label
      htmlFor={generatedId}
      className={cn(
        'inline-flex items-center gap-2.5 select-none cursor-pointer group',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      <input
        type="checkbox"
        id={generatedId}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={cn(
          'w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors',
          checked
            ? 'bg-[#E3EBDD] border-[#D0DEC8] text-[#283824]'
            : 'bg-white border-[#EAE6DF] group-hover:border-[#C8BEDE]',
          'focus-within:ring-2 focus-within:ring-[#C8BEDE]'
        )}
      >
        <AnimatePresence initial={false}>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {label && (
        <span
          className={cn(
            'text-xs sm:text-sm font-medium transition-colors',
            checked ? 'text-[#85817D] line-through' : 'text-[#33312F]'
          )}
        >
          {label}
        </span>
      )}
    </label>
  )
}
