import React from 'react'
import Link from 'next/link'
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Flame,
  BrainCircuit,
  Lock,
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export default async function HomePage() {
  const configured = isSupabaseConfigured()
  let user = null

  if (configured) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      // Ignored for unconfigured local setup
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2D2D] selection:bg-[#E8E1F4]">
      {/* Top Bar */}
      <header className="border-b border-[#E8E6E1] bg-[#FAF9F6]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E8E1F4] border border-[#D8CCE8] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#322A42]" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Mindspace<span className="text-[#706E6B] font-normal">.ai</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {!configured ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EBD5] border border-[#E4D8BE] text-xs font-medium text-[#3B3320]">
                <span className="w-2 h-2 rounded-full bg-[#E5B54F] animate-pulse" />
                Dev Mode (.env setup pending)
              </span>
            ) : user ? (
              <span className="text-xs text-[#706E6B] font-medium">
                {user.email}
              </span>
            ) : null}

            {user ? (
              <Link
                href="/app"
                className="px-4 py-2 rounded-xl bg-[#2D2D2D] text-[#FAF9F6] text-xs font-medium hover:bg-[#1A1A1A] transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/app"
                  className="px-3.5 py-1.5 rounded-xl border border-[#E8E6E1] bg-white text-xs font-medium text-[#2D2D2D] hover:bg-[#F9F9F9] transition-all"
                >
                  Enter Workspace
                </Link>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl bg-[#2D2D2D] text-[#FAF9F6] text-xs font-medium hover:bg-[#1A1A1A] transition-all shadow-xs"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E3EBDD] border border-[#CFDBC6] text-xs font-medium text-[#283824] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D7535]" />
            Tactile Pastel Surfaces &bull; Gemini 2.5 AI Powered
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2D2D2D] leading-[1.15]">
            Your thoughts, habits, and daily flow on delightful pastel surfaces.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#706E6B] leading-relaxed">
            A premium, mindful workspace blending tactile sticky notes, habit tracking, daily time-blocking, and an intelligent Gemini copilot.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="px-6 py-3 rounded-xl bg-[#2D2D2D] text-[#FAF9F6] text-sm font-medium hover:bg-[#1A1A1A] transition-all shadow-sm flex items-center gap-2"
            >
              <span>Explore Workspace Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-5 py-3 rounded-xl bg-white border border-[#E8E6E1] text-sm font-medium text-[#2D2D2D] hover:bg-[#F9F9F9] transition-all"
            >
              Access Account
            </Link>
          </div>
        </div>

        {/* Tactile Pastel Sticky Notes Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sticky 1: Intelligent Notes */}
          <div className="relative bg-[#F4EBD5] border border-[#E4D8BE] rounded-2xl p-6 shadow-sm sticky-surface transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="w-8 h-8 rounded-lg bg-[#E6D7B4] flex items-center justify-center mb-4">
              <BookOpen className="w-4 h-4 text-[#3B3320]" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#706E6B]">
              Module 01
            </span>
            <h3 className="text-lg font-bold text-[#2D2D2D] mt-1 mb-2">
              Intelligent Notes
            </h3>
            <p className="text-xs text-[#4A4A4A] leading-relaxed mb-4">
              Fluid sticky-canvas with pastel color tagging, markdown formatting, and bi-directional cross-links.
            </p>
            <div className="pt-3 border-t border-[#E4D8BE]/70 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[10px] font-medium text-[#3B3320]">
                #ideas
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[10px] font-medium text-[#3B3320]">
                #research
              </span>
            </div>
          </div>

          {/* Sticky 2: Habit Tracking */}
          <div className="relative bg-[#E3EBDD] border border-[#CFDBC6] rounded-2xl p-6 shadow-sm sticky-surface transform rotate-1 hover:rotate-0 transition-transform">
            <div className="w-8 h-8 rounded-lg bg-[#C8D9BD] flex items-center justify-center mb-4">
              <Flame className="w-4 h-4 text-[#283624]" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#706E6B]">
              Module 02
            </span>
            <h3 className="text-lg font-bold text-[#2D2D2D] mt-1 mb-2">
              Habits & Streaks
            </h3>
            <p className="text-xs text-[#4A4A4A] leading-relaxed mb-4">
              Tactile daily check-offs, consistency heatmaps, and streak celebrations designed to build momentum.
            </p>
            <div className="pt-3 border-t border-[#CFDBC6]/70 flex items-center justify-between text-xs text-[#283624] font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3D7535]" />
                Daily Meditation
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[10px]">14d 🔥</span>
            </div>
          </div>

          {/* Sticky 3: Daily Planner */}
          <div className="relative bg-[#DFEAF2] border border-[#CBDCE8] rounded-2xl p-6 shadow-sm sticky-surface transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="w-8 h-8 rounded-lg bg-[#C2D8E6] flex items-center justify-center mb-4">
              <Calendar className="w-4 h-4 text-[#213545]" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#706E6B]">
              Module 03
            </span>
            <h3 className="text-lg font-bold text-[#2D2D2D] mt-1 mb-2">
              Daily Planner
            </h3>
            <p className="text-xs text-[#4A4A4A] leading-relaxed mb-4">
              Harmonious time-blocking timeline with drag-and-drop task scheduling and morning intentions.
            </p>
            <div className="pt-3 border-t border-[#CBDCE8]/70 flex items-center gap-2 text-xs text-[#213545]">
              <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[10px] font-medium">
                09:00 - Deep Focus
              </span>
            </div>
          </div>

          {/* Sticky 4: AI Companion */}
          <div className="relative bg-[#E8E1F4] border border-[#D8CCE8] rounded-2xl p-6 shadow-sm sticky-surface transform rotate-1 hover:rotate-0 transition-transform">
            <div className="w-8 h-8 rounded-lg bg-[#D6C7EC] flex items-center justify-center mb-4">
              <BrainCircuit className="w-4 h-4 text-[#322A42]" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#706E6B]">
              Module 04
            </span>
            <h3 className="text-lg font-bold text-[#2D2D2D] mt-1 mb-2">
              Gemini Companion
            </h3>
            <p className="text-xs text-[#4A4A4A] leading-relaxed mb-4">
              Retrieval-augmented knowledge synthesis, morning briefs, and automated tool scheduling.
            </p>
            <div className="pt-3 border-t border-[#D8CCE8]/70 flex items-center gap-1.5 text-[11px] text-[#322A42] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#5B3E8C]" />
              <span>&ldquo;Ready for your daily brief?&rdquo;</span>
            </div>
          </div>
        </div>

        {/* Security & RLS Architecture Section */}
        <div className="mt-16 bg-white border border-[#E8E6E1] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#706E6B]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2D2D2D]">
                Multi-Tenant Row Level Security &amp; pgvector
              </h4>
              <p className="text-xs text-[#706E6B] mt-1 max-w-xl">
                Every table in PostgreSQL is locked down with strict RLS policies (<code className="bg-[#FAF9F6] px-1 py-0.5 rounded text-[11px]">auth.uid() = user_id</code>). All vectors are privately indexed per tenant.
              </p>
            </div>
          </div>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-xs font-medium text-[#2D2D2D] hover:bg-[#F2EFE8] transition-all shrink-0"
          >
            Create Test Account
          </Link>
        </div>
      </main>
    </div>
  )
}
