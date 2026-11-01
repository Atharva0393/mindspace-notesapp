'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Heart,
} from 'lucide-react'
import { JournalEntry, MOOD_DEFINITIONS } from '@/types/journal'
import { PASTEL_PALETTE } from '@/lib/constants/colors'
import { cn } from '@/lib/utils'

export interface JournalCardProps {
  entry: JournalEntry
  onOpen: (entry: JournalEntry) => void
  onToggleFavorite: (id: string, isFavorite: boolean) => void
  onDelete: (id: string) => void
  todayDateStr?: string
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
}

export function JournalCard({
  entry,
  onOpen,
  onToggleFavorite,
  onDelete,
  todayDateStr = '',
}: JournalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const palette = PASTEL_PALETTE[entry.colorTheme] || PASTEL_PALETTE.peach
  const moodDef = entry.moodLevel ? MOOD_DEFINITIONS[entry.moodLevel] : null

  const isToday = todayDateStr ? entry.entryDate === todayDateStr : false
  const plainExcerpt = stripHtml(entry.content)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      onClick={() => onOpen(entry)}
      className={cn(
        'group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm hover:scale-[1.01]',
        palette.bgClass,
        palette.borderClass
      )}
    >
      {/* Top Bar: Date, Mood Pill, Favorite Star, Context Menu */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Entry Date */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#605D58] bg-white/70 px-2 py-0.5 rounded-full border border-black/5">
            <Calendar className="w-3 h-3 text-[#85817D]" />
            {isToday ? 'Today' : entry.entryDate}
          </span>

          {/* Mood Pill */}
          {moodDef && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border',
                moodDef.badgeClass
              )}
            >
              <span>{moodDef.emoji}</span>
              <span>{moodDef.label}</span>
            </span>
          )}

          {/* Gratitude Indicator */}
          {entry.gratitudeItems && entry.gratitudeItems.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
              {entry.gratitudeItems.length} Graces
            </span>
          )}
        </div>

        {/* Right: Favorite & Menu */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onToggleFavorite(entry.id, !entry.isFavorite)}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              entry.isFavorite
                ? 'text-amber-500 hover:bg-white/60'
                : 'text-[#85817D] hover:bg-white/60 opacity-0 group-hover:opacity-100'
            )}
            title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('w-4 h-4', entry.isFavorite && 'fill-current')} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-[#605D58] hover:bg-white/60 transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#E8E6DF] rounded-xl shadow-lg py-1 z-30 text-xs text-[#33312F]">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onOpen(entry)
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#FAF9F6] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#85817D]" />
                    Edit Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(entry.id)
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete Entry
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Title & Excerpt */}
      <div className="space-y-1.5 mb-4 flex-1">
        <h3 className="text-base font-bold tracking-tight text-[#33312F] line-clamp-1">
          {entry.title}
        </h3>
        {entry.promptQuestion && (
          <p className="text-xs font-medium text-[#7A6332] italic line-clamp-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            &ldquo;{entry.promptQuestion}&rdquo;
          </p>
        )}
        <p className="text-xs text-[#605D58] line-clamp-3 leading-relaxed">
          {plainExcerpt || 'Empty journal reflection...'}
        </p>
      </div>

      {/* Footer: Emotion Chips & Tags */}
      <div className="pt-2 border-t border-black/8 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {entry.emotions.slice(0, 3).map((emotion) => (
            <span
              key={emotion}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/70 border border-black/5 text-[#33312F]"
            >
              {emotion}
            </span>
          ))}
          {entry.emotions.length > 3 && (
            <span className="text-[10px] text-[#85817D]">
              +{entry.emotions.length - 3}
            </span>
          )}
        </div>

        {entry.tags.length > 0 && (
          <span className="text-[10px] font-mono text-[#85817D]">
            #{entry.tags[0]}
          </span>
        )}
      </div>
    </motion.div>
  )
}

