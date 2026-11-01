'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils/styling'

export function GlobalSearch({ className }: { className?: string }) {
  function handleOpen() {
    window.dispatchEvent(new CustomEvent('open-command-palette'))
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={cn(
        'flex items-center justify-between w-48 sm:w-64 h-9 px-3 rounded-[11px] bg-[#F5F2EB] border border-[#EAE6DF] text-xs text-[#85817D] hover:bg-[#EAE6DF]/60 transition-colors cursor-pointer select-none',
        className
      )}
    >
      <div className="flex items-center gap-2 truncate">
        <Search className="w-3.5 h-3.5 shrink-0 text-[#85817D]" />
        <span className="truncate">Search or command...</span>
      </div>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] bg-white border border-[#EAE6DF] text-[10px] text-[#85817D] font-mono shrink-0">
        ⌘K
      </kbd>
    </button>
  )
}

