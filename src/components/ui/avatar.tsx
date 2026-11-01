'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/styling'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name?: string | null
  size?: AvatarSize
}

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizeStyles: Record<AvatarSize, { container: string; text: string; px: number }> = {
    sm: { container: 'w-7 h-7 rounded-[9px]', text: 'text-[11px]', px: 28 },
    md: { container: 'w-9 h-9 rounded-[11px]', text: 'text-xs', px: 36 },
    lg: { container: 'w-11 h-11 rounded-[13px]', text: 'text-sm font-semibold', px: 44 },
    xl: { container: 'w-14 h-14 rounded-[16px]', text: 'text-base font-semibold', px: 56 },
  }

  function getInitials(fullName?: string | null) {
    if (!fullName) return 'U'
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const initials = getInitials(name)
  const currentSize = sizeStyles[size]

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden select-none shrink-0 border border-[#EAE6DF] bg-[#E8E1F4] text-[#352749]',
        currentSize.container,
        className
      )}
      aria-label={name || 'User avatar'}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name || 'Avatar'}
          width={currentSize.px}
          height={currentSize.px}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={cn('font-medium tracking-wide', currentSize.text)}>
          {initials}
        </span>
      )}
    </div>
  )
}

