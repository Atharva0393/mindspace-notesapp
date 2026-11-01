'use client'

import React, { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Tooltip } from './tooltip'
import { cn } from '@/lib/utils/styling'

export type IconButtonVariant = 'ghost' | 'secondary' | 'outline' | 'pastel'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode
  label: string // Used for aria-label and optional tooltip
  showTooltip?: boolean
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  variant?: IconButtonVariant
  size?: IconButtonSize
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      icon,
      label,
      showTooltip = true,
      tooltipPosition = 'top',
      variant = 'ghost',
      size = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles: Record<IconButtonSize, string> = {
      sm: 'w-7 h-7 rounded-[8px]',
      md: 'w-9 h-9 rounded-[10px]',
      lg: 'w-10 h-10 rounded-[12px]',
    }

    const variantStyles: Record<IconButtonVariant, string> = {
      ghost:
        'bg-transparent text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB] active:bg-[#EAE6DF]',
      secondary:
        'bg-[#F5F2EB] text-[#33312F] border border-[#EAE6DF] hover:bg-[#EAE6DF]',
      outline:
        'bg-white text-[#85817D] border border-[#EAE6DF] hover:text-[#33312F] hover:bg-[#FAF9F6]',
      pastel:
        'bg-[#E8E1F4] text-[#352749] border border-[#D8CEE8] hover:bg-[#DDD2EF]',
    }

    const buttonElement = (
      <motion.button
        ref={ref}
        type="button"
        aria-label={label}
        whileTap={{ scale: disabled ? 1 : 0.94 }}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center transition-colors cursor-pointer select-none',
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C8BEDE]',
          'disabled:opacity-40 disabled:pointer-events-none',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icon}
      </motion.button>
    )

    if (showTooltip && label) {
      return (
        <Tooltip content={label} position={tooltipPosition}>
          {buttonElement}
        </Tooltip>
      )
    }

    return buttonElement
  }
)

IconButton.displayName = 'IconButton'

