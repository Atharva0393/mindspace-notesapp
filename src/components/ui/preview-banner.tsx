'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, X, ArrowRight } from 'lucide-react'

export function PreviewBanner() {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('mindspace_preview_banner_dismissed')
      if (stored === 'true') {
        setIsDismissed(true)
      }
    }
  }, [])

  if (isDismissed) {
    return null
  }

  function handleDismiss() {
    setIsDismissed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mindspace_preview_banner_dismissed', 'true')
    }
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#F4EBD5]/90 via-[#E8E1F4]/70 to-[#DFEAF2]/90 border border-[#E8E6DF] p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/90 border border-[#E0DCCE] flex items-center justify-center shrink-0 text-[#7A6332] shadow-2xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0 text-xs">
          <div className="font-semibold text-[#33312F] flex items-center gap-2 flex-wrap">
            <span>✨ Guest Preview Mode</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-white/80 text-[#605C57] border border-[#E8E6DF]">
              Saved to this browser
            </span>
          </div>
          <p className="text-[#706E6B] text-[11px] mt-0.5">
            You are testing with local preview data. Sign in or create an account to unlock persistent Supabase cloud sync and Gemini AI.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <Link
          href="/login"
          className="text-xs font-medium px-3.5 py-1.5 rounded-xl bg-[#33312F] text-[#FAF9F6] hover:bg-[#1F1E1D] transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>Sign In / Join</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-[#85817D] hover:text-[#33312F] hover:bg-white/60 transition-colors cursor-pointer"
          aria-label="Dismiss guest preview banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
