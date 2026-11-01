import React from 'react'
import { cn } from '@/lib/utils/styling'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'circle'
}

export function Skeleton({
  variant = 'text',
  className,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 w-full rounded-[6px]',
    card: 'h-32 w-full rounded-[16px]',
    circle: 'h-10 w-10 rounded-full',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-[#EAE6DF]/60 select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export function StickyGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[18px] border border-[#EAE6DF] bg-white/70 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-6 rounded-md" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="pt-3 border-t border-[#EAE6DF]/60 flex gap-2">
            <Skeleton className="h-5 w-12 rounded-[6px]" />
            <Skeleton className="h-5 w-16 rounded-[6px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

