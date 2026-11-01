import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils/styling'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full min-h-[90px] p-3.5 bg-white border border-[#EAE6DF] rounded-[12px] text-xs sm:text-sm text-[#33312F] placeholder-[#AFAAA4]',
            'leading-relaxed transition-all duration-150 resize-y',
            'focus:outline-hidden focus:border-[#C8BEDE] focus:ring-2 focus:ring-[#E8E1F4]',
            'disabled:opacity-50 disabled:bg-[#FAF9F6] disabled:pointer-events-none',
            error && 'border-[#E8C2B8] bg-[#FFFBFB] focus:border-[#C95D4A] focus:ring-[#F7DFD8]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[#A8382B]">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

