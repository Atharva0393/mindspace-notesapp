import React from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between p-4 sm:p-8 selection:bg-[#E8E1F4]">
      {/* Subtle background pastel sticky accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-12 -left-12 w-96 h-96 bg-[#F4E4DC]/40 rounded-3xl transform -rotate-6 blur-2xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#E8E1F4]/40 rounded-3xl transform rotate-12 blur-2xl" />
        <div className="absolute -bottom-16 left-1/4 w-96 h-96 bg-[#E3EBDD]/40 rounded-3xl transform rotate-3 blur-2xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
          <div className="w-8 h-8 rounded-xl bg-[#E8E1F4] border border-[#D8CCE8] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-[#322A42]" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#2D2D2D]">
            Notepad<span className="text-[#706E6B] font-normal">.ai</span>
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto text-center text-xs text-[#706E6B] py-2">
        A thoughtful space for your notes, habits, and daily flow.
      </footer>
    </div>
  )
}

