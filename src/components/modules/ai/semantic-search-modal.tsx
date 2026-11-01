'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Search,
  StickyNote,
  CheckSquare,
  Target,
  Flame,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { AISourceReference, KnowledgeSourceType, AIContextPreferences } from '@/types/ai'
import { semanticSearchAction } from '@/app/app/ai/actions'

interface SemanticSearchModalProps {
  isOpen: boolean
  onClose: () => void
  preferences: AIContextPreferences
}

function getSourceIcon(sourceType: KnowledgeSourceType) {
  switch (sourceType) {
    case 'note':
      return <StickyNote className="w-4 h-4 text-[#946A1E]" />
    case 'task':
      return <CheckSquare className="w-4 h-4 text-[#2E6826]" />
    case 'goal':
      return <Target className="w-4 h-4 text-[#1E3345]" />
    case 'habit':
      return <Flame className="w-4 h-4 text-[#A84232]" />
    case 'daily_plan':
      return <Calendar className="w-4 h-4 text-[#4D327B]" />
    case 'journal':
      return <BookOpen className="w-4 h-4 text-[#73355A]" />
  }
}

function getSourceBadge(sourceType: KnowledgeSourceType) {
  switch (sourceType) {
    case 'note':
      return <PastelBadge variant="buttercream" size="sm">Note</PastelBadge>
    case 'task':
      return <PastelBadge variant="sage" size="sm">Task</PastelBadge>
    case 'goal':
      return <PastelBadge variant="powder" size="sm">Goal</PastelBadge>
    case 'habit':
      return <PastelBadge variant="peach" size="sm">Habit</PastelBadge>
    case 'daily_plan':
      return <PastelBadge variant="lavender" size="sm">Plan</PastelBadge>
    case 'journal':
      return <PastelBadge variant="pink" size="sm">Journal</PastelBadge>
  }
}

export function SemanticSearchModal({
  isOpen,
  onClose,
  preferences,
}: SemanticSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AISourceReference[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    startTransition(async () => {
      const response = await semanticSearchAction(query, preferences)
      if (response.status === 'success' && response.data) {
        setResults(response.data.results)
      } else {
        setResults([])
      }
      setHasSearched(true)
    })
  }

  const handleSelectQuick = (sampleQuery: string) => {
    setQuery(sampleQuery)
    startTransition(async () => {
      const response = await semanticSearchAction(sampleQuery, preferences)
      if (response.status === 'success' && response.data) {
        setResults(response.data.results)
      } else {
        setResults([])
      }
      setHasSearched(true)
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Semantic Workspace Search"
      description="Natural-language conceptual search across your authorized notes, tasks, habits, and goals."
      maxWidth="lg"
    >
      <div className="space-y-4 pt-1">
        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas, priorities, or reflections (e.g. 'design principles', 'overdue tasks')..."
            className="w-full h-11 pl-10 pr-24 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] text-sm text-[#33312F] placeholder-[#85817D] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#85817D]"
            autoFocus
          />
          <Search className="w-4 h-4 text-[#85817D] absolute left-3.5 top-3.5" />
          <button
            type="submit"
            disabled={!query.trim() || isPending}
            className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-[#33312F] text-white text-xs font-medium hover:bg-[#33312F]/90 disabled:opacity-40 transition-opacity"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Quick Sample Prompts */}
        {!hasSearched && (
          <div className="pt-2">
            <div className="text-xs font-medium text-[#85817D] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Try asking questions like:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'design principles & warmth',
                'upcoming deadlines & high priorities',
                'daily routine & habit streaks',
                'active ambitions & goal progress',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleSelectQuick(sample)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-[#EAE6DF]/60 border border-[#EAE6DF] text-xs text-[#524F4A] transition-colors"
                >
                  &ldquo;{sample}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {hasSearched && (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-[#85817D] px-1">
              <span>
                Found {results.length} relevant record{results.length === 1 ? '' : 's'}
              </span>
              <span>Sorted by conceptual similarity</span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#85817D] bg-[#FAF9F6] rounded-xl border border-[#EAE6DF]">
                No matching records found in authorized modules.
              </div>
            ) : (
              results.map((res) => (
                <Link
                  key={res.id}
                  href={res.url || '#'}
                  onClick={onClose}
                  className="block p-3 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#EAE6DF] transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#FAF9F6] border border-[#EAE6DF] flex items-center justify-center">
                        {getSourceIcon(res.sourceType)}
                      </div>
                      <span className="text-xs font-semibold text-[#33312F] group-hover:text-[#1E3345]">
                        {res.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSourceBadge(res.sourceType)}
                      <ArrowRight className="w-3.5 h-3.5 text-[#85817D] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                  <p className="text-xs text-[#524F4A] line-clamp-2 pl-8">{res.excerpt}</p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
