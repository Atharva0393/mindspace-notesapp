'use client'

import React, { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/styling'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'pastel'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C8BEDE] disabled:pointer-events-none disabled:opacity-50 cursor-pointer'

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs rounded-[10px] gap-1.5',
      md: 'h-9 px-4 text-xs sm:text-sm rounded-[11px] gap-2',
      lg: 'h-11 px-5 text-sm sm:text-base rounded-[12px] gap-2.5',
      icon: 'h-9 w-9 rounded-[11px] p-0 shrink-0',
    }

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-[#33312F] text-[#FAF9F6] hover:bg-[#1F1E1D] active:bg-[#151413] shadow-xs',
      secondary:
        'bg-[#F5F2EB] text-[#33312F] border border-[#EAE6DF] hover:bg-[#EAE6DF] active:bg-[#DFDAD2]',
      ghost:
        'bg-transparent text-[#33312F] hover:bg-[#F5F2EB] active:bg-[#EAE6DF]',
      outline:
        'bg-white text-[#33312F] border border-[#EAE6DF] hover:bg-[#FAF9F6] active:bg-[#F5F2EB]',
      destructive:
        'bg-[#F7DFD8] text-[#7A281E] border border-[#E8C2B8] hover:bg-[#F2D1C8] active:bg-[#EBBFA3]',
      pastel:
        'bg-[#E8E1F4] text-[#352749] border border-[#D8CEE8] hover:bg-[#DDD2EF] active:bg-[#D2C5E7]',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

