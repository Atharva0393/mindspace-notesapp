'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/styling'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  id?: string
  className?: string
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  id,
  className,
}: SwitchProps) {
  const defaultId = React.useId()
  const generatedId = id || defaultId

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <button
        type="button"
        role="switch"
        id={generatedId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out',
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C8BEDE]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'bg-[#E8E1F4] border-[#D8CEE8]'
            : 'bg-[#F5F2EB] border-[#EAE6DF]'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
          style={{ marginTop: '1px' }}
        />
      </button>

      {label && (
        <label
          htmlFor={generatedId}
          className="text-xs sm:text-sm font-medium text-[#33312F] cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  )
}
