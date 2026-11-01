'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight, AlertCircle, CheckCircle2, Sparkles, KeyRound, Mail, User } from 'lucide-react'
import { signup } from '../actions'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const res = await signup(formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        setSuccessMessage(res.message || 'Account created! Please check your email.')
      }
    })
  }

  return (
    <div className="w-full max-w-md">
      {/* Pastel Sticky Card Container */}
      <div className="relative bg-[#FFFFFF] border border-[#E8E6E1] rounded-2xl p-8 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] sticky-surface">
        {/* Decorative Tape Element */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#E8E1F4]/80 backdrop-blur-xs rounded-sm -rotate-1 shadow-xs border border-[#D8CCE8]/50" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EBDD] text-[#283624] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Fresh</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            Create your workspace
          </h1>
          <p className="text-sm text-[#706E6B] mt-1.5">
            Organize notes, build positive habits, and plan mindfully.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#F4E4DC] border border-[#E5D2C8] text-[#3E2B25] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C95D4A]" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#E3EBDD] border border-[#CFDBC6] text-[#283624] text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#3D7535]" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                name="fullName"
                type="text"
                placeholder="Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl text-sm text-[#2D2D2D] placeholder-[#A3A19E] focus:outline-hidden focus:ring-2 focus:ring-[#E8E1F4] focus:border-[#D8CCE8] transition-all"
              />
              <User className="w-4 h-4 text-[#A3A19E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2D2D2D] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl text-sm text-[#2D2D2D] placeholder-[#A3A19E] focus:outline-hidden focus:ring-2 focus:ring-[#E8E1F4] focus:border-[#D8CCE8] transition-all"
              />
              <Mail className="w-4 h-4 text-[#A3A19E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2D2D2D] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl text-sm text-[#2D2D2D] placeholder-[#A3A19E] focus:outline-hidden focus:ring-2 focus:ring-[#E8E1F4] focus:border-[#D8CCE8] transition-all"
              />
              <KeyRound className="w-4 h-4 text-[#A3A19E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#2D2D2D] text-[#FAF9F6] text-sm font-medium hover:bg-[#1A1A1A] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isPending ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E8E6E1] text-center text-xs text-[#706E6B]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-[#2D2D2D] hover:underline underline-offset-4"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}

