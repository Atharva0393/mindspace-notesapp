'use client'

import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, Search } from 'lucide-react'
import { cn } from '@/lib/utils/styling'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isSearch?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error,
      leftIcon,
      rightIcon,
      isSearch,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    const actualLeftIcon = isSearch ? (
      <Search className="w-4 h-4 text-[#85817D]" />
    ) : (
      leftIcon
    )

    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {actualLeftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#85817D]">
              {actualLeftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full h-10 px-3.5 bg-white border border-[#EAE6DF] rounded-[11px] text-xs sm:text-sm text-[#33312F] placeholder-[#AFAAA4]',
              'transition-all duration-150',
              'focus:outline-hidden focus:border-[#C8BEDE] focus:ring-2 focus:ring-[#E8E1F4]',
              'disabled:opacity-50 disabled:bg-[#FAF9F6] disabled:pointer-events-none',
              actualLeftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error && 'border-[#E8C2B8] bg-[#FFFBFB] focus:border-[#C95D4A] focus:ring-[#F7DFD8]',
              className
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-0.5 text-[#85817D] hover:text-[#33312F] focus:outline-hidden cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center pointer-events-none text-[#85817D]">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-[#A8382B] flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

