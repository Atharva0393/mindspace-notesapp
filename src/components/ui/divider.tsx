import React from 'react'
import { cn } from '@/lib/utils/styling'

export interface DividerProps {
  label?: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({
  label,
  orientation = 'horizontal',
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('inline-block h-full w-[1px] bg-[#EAE6DF] self-stretch mx-2', className)}
        role="separator"
        aria-orientation="vertical"
      />
    )
  }

  if (label) {
    return (
      <div
        className={cn('relative flex items-center w-full my-4', className)}
        role="separator"
      >
        <div className="flex-grow border-t border-[#EAE6DF]" />
        <span className="shrink-0 px-3 text-[11px] font-medium text-[#85817D] bg-[#FAF9F6]">
          {label}
        </span>
        <div className="flex-grow border-t border-[#EAE6DF]" />
      </div>
    )
  }

  return (
    <hr
      className={cn('w-full border-0 border-t border-[#EAE6DF] my-4', className)}
      role="separator"
    />
  )
}

