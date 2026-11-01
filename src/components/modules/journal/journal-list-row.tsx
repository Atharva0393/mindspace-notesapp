'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  Heart,
} from 'lucide-react'
import { JournalEntry, MOOD_DEFINITIONS } from '@/types/journal'
import { cn } from '@/lib/utils'

export interface JournalListRowProps {
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

export function JournalListRow({
  entry,
  onOpen,
  onToggleFavorite,
  onDelete,
  todayDateStr = '',
}: JournalListRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const moodDef = entry.moodLevel ? MOOD_DEFINITIONS[entry.moodLevel] : null
  const isToday = todayDateStr ? entry.entryDate === todayDateStr : false
  const plainExcerpt = stripHtml(entry.content)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={() => onOpen(entry)}
      className="group relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs transition-all cursor-pointer"
    >
      {/* Left: Date & Mood */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-20 shrink-0 text-left">
          <span className="text-[11px] font-semibold text-[#85817D] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {isToday ? 'Today' : entry.entryDate}
          </span>
        </div>

        {/* Mood Icon */}
        <div className="shrink-0">
          {moodDef ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border',
                moodDef.badgeClass
              )}
            >
              <span>{moodDef.emoji}</span>
              <span className="hidden sm:inline">{moodDef.label}</span>
            </span>
          ) : (
            <span className="text-xs text-[#85817D]">—</span>
          )}
        </div>

        {/* Title & Excerpt */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#33312F] truncate">
              {entry.title}
            </span>
            {entry.gratitudeItems && entry.gratitudeItems.length > 0 && (
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-[#85817D] truncate">
            {plainExcerpt || 'Empty journal reflection...'}
          </p>
        </div>

        {/* Emotions */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {entry.emotions.slice(0, 2).map((emotion) => (
            <span
              key={emotion}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#E8E6DF] text-[#605D58]"
            >
              {emotion}
            </span>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onToggleFavorite(entry.id, !entry.isFavorite)}
          className={cn(
            'p-1.5 rounded-lg transition-colors cursor-pointer',
            entry.isFavorite
              ? 'text-amber-500 hover:bg-[#FAF9F6]'
              : 'text-[#85817D] hover:bg-[#FAF9F6] opacity-0 group-hover:opacity-100'
          )}
          title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={cn('w-4 h-4', entry.isFavorite && 'fill-current')} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-[#85817D] hover:bg-[#FAF9F6] hover:text-[#33312F] transition-colors cursor-pointer"
            aria-label="More options"
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
    </motion.div>
  )
}

