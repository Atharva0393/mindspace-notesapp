'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  ArrowLeft,
  Star,
  Check,
  CloudCheck,
  RotateCw,
  Sparkles,
  Calendar,
  Tag,
  Palette,
  CheckCircle2,
} from 'lucide-react'
import { JournalEntry, MoodLevel, MOOD_DEFINITIONS, COMMON_EMOTION_TAGS } from '@/types/journal'
import { PASTEL_PALETTE, PastelColorKey, PASTEL_COLOR_KEYS } from '@/lib/constants/colors'
import { EditorToolbar } from '@/components/modules/notes/editor-toolbar'
import { cn } from '@/lib/utils'

export interface JournalEditorProps {
  entry: JournalEntry
  onSave: (updated: Partial<JournalEntry>) => Promise<void>
  onClose: () => void
  isConfigured?: boolean
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function JournalEditor({
  entry,
  onSave,
  onClose,
  isConfigured: _isConfigured = true,
}: JournalEditorProps) {
  const [title, setTitle] = useState(entry.title || '')
  const [moodLevel, setMoodLevel] = useState<MoodLevel | null>(entry.moodLevel || null)
  const [emotions, setEmotions] = useState<string[]>(entry.emotions || [])
  const [colorTheme, setColorTheme] = useState<PastelColorKey>(entry.colorTheme || 'peach')
  const [isFavorite, setIsFavorite] = useState(entry.isFavorite)
  const [entryDate, setEntryDate] = useState(entry.entryDate)
  const [promptQuestion, setPromptQuestion] = useState(entry.promptQuestion || null)

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [colorMenuOpen, setColorMenuOpen] = useState(false)
  const [moodMenuOpen, setMoodMenuOpen] = useState(false)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isDirtyRef = useRef(false)

  // TipTap Editor instance
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#442A20] underline underline-offset-2' },
      }),
      Placeholder.configure({
        placeholder: 'Pour your thoughts, reflections, or stream of consciousness here...',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: entry.content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-stone max-w-none focus:outline-none min-h-[420px] text-sm text-[#33312F] leading-relaxed',
      },
    },
    onUpdate: () => {
      isDirtyRef.current = true
      scheduleAutoSave()
    },
  })

  // Perform Save with genuine confirmation status
  const performSave = useCallback(
    async (overrideData?: Partial<JournalEntry>) => {
      if (!editor) return
      setSaveStatus('saving')

      const currentContent = editor.getHTML()
      const currentJson = editor.getJSON()

      const payload: Partial<JournalEntry> = {
        title: title.trim() || 'Untitled Reflection',
        content: currentContent,
        contentJson: currentJson as Record<string, unknown>,
        moodLevel,
        emotions,
        colorTheme,
        isFavorite,
        entryDate,
        promptQuestion,
        ...overrideData,
      }

      try {
        await onSave(payload)
        isDirtyRef.current = false
        setSaveStatus('saved')
        const now = new Date()
        setLastSavedTime(
          `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}`
        )
      } catch (err) {
        console.error('Error auto-saving journal entry:', err)
        setSaveStatus('error')
      }
    },
    [editor, title, moodLevel, emotions, colorTheme, isFavorite, entryDate, promptQuestion, onSave]
  )

  const scheduleAutoSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setSaveStatus('saving')
    debounceTimerRef.current = setTimeout(() => {
      performSave()
    }, 850)
  }, [performSave])

  // Handle Title Change
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    isDirtyRef.current = true
    scheduleAutoSave()
  }

  // Handle Mood Change
  function handleSelectMood(level: MoodLevel) {
    setMoodLevel(level)
    setMoodMenuOpen(false)
    performSave({ moodLevel: level })
  }

  // Handle Color Theme Change
  function handleSelectColor(theme: PastelColorKey) {
    setColorTheme(theme)
    setColorMenuOpen(false)
    performSave({ colorTheme: theme })
  }

  // Handle Favorite Toggle
  function handleToggleFavorite() {
    const next = !isFavorite
    setIsFavorite(next)
    performSave({ isFavorite: next })
  }

  // Toggle Emotion Tag
  function handleToggleEmotion(tag: string) {
    const next = emotions.includes(tag)
      ? emotions.filter((e) => e !== tag)
      : [...emotions, tag]
    setEmotions(next)
    performSave({ emotions: next })
  }

  // Keyboard shortcut: Cmd/Ctrl + S
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        performSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [performSave])

  // Cleanup pending timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const palette = PASTEL_PALETTE[colorTheme] || PASTEL_PALETTE.peach
  const activeMood = moodLevel ? MOOD_DEFINITIONS[moodLevel] : null

  return (
    <div
      className={cn(
        'rounded-3xl border transition-all duration-300 shadow-sm flex flex-col min-h-[750px] max-w-4xl mx-auto',
        palette.bgClass,
        palette.borderClass
      )}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-black/8 bg-white/50 backdrop-blur-xs rounded-t-3xl flex-wrap">
        {/* Left: Back & Date */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 text-[#605D58] hover:text-[#33312F] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Journal</span>
          </button>

          <div className="h-4 w-px bg-black/10" />

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#605D58] bg-white/70 px-2.5 py-1 rounded-xl border border-black/5">
            <Calendar className="w-3.5 h-3.5 text-[#85817D]" />
            <input
              type="date"
              value={entryDate}
              onChange={(e) => {
                setEntryDate(e.target.value)
                performSave({ entryDate: e.target.value })
              }}
              className="bg-transparent border-none outline-none text-xs text-[#33312F] cursor-pointer"
            />
          </div>
        </div>

        {/* Center / Right: Mood, Palette, Favorite, Save Status */}
        <div className="flex items-center gap-2">
          {/* Mood Pill / Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoodMenuOpen(!moodMenuOpen)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer',
                activeMood
                  ? activeMood.badgeClass
                  : 'bg-white/80 border-black/5 text-[#605D58] hover:bg-white'
              )}
            >
              {activeMood ? (
                <>
                  <span>{activeMood.emoji}</span>
                  <span>{activeMood.label}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tag Mood</span>
                </>
              )}
            </button>

            {moodMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMoodMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-[#E8E6DF] rounded-2xl shadow-xl py-1.5 z-30 space-y-1 p-1">
                  {(['excellent', 'good', 'neutral', 'low', 'very_low'] as MoodLevel[]).map(
                    (lvl) => {
                      const def = MOOD_DEFINITIONS[lvl]
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSelectMood(lvl)}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer',
                            moodLevel === lvl ? 'bg-[#FAF9F6] font-bold' : 'hover:bg-[#FAF9F6]'
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span>{def.emoji}</span>
                            <span className={def.textClass}>{def.label}</span>
                          </span>
                          {moodLevel === lvl && <Check className="w-3 h-3 text-[#33312F]" />}
                        </button>
                      )
                    }
                  )}
                </div>
              </>
            )}
          </div>

          {/* Color Palette Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColorMenuOpen(!colorMenuOpen)}
              className="p-1.5 rounded-xl hover:bg-white/70 text-[#605D58] transition-colors cursor-pointer"
              title="Change stationery theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {colorMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setColorMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#E8E6DF] rounded-2xl shadow-xl p-2 z-30">
                  <div className="text-[11px] font-semibold text-[#85817D] uppercase mb-1.5 px-1">
                    Stationery Palette
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PASTEL_COLOR_KEYS.map((k) => {
                      const p = PASTEL_PALETTE[k]
                      const isSelected = colorTheme === k
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleSelectColor(k)}
                          className={cn(
                            'h-8 rounded-lg border flex items-center justify-center transition-transform cursor-pointer',
                            p.bgClass,
                            p.borderClass,
                            isSelected && 'ring-2 ring-[#33312F]'
                          )}
                          title={p.name}
                        >
                          {isSelected && <Check className="w-3 h-3 text-[#33312F]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Favorite Star */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={cn(
              'p-1.5 rounded-xl transition-colors cursor-pointer',
              isFavorite
                ? 'text-amber-500 hover:bg-white/70'
                : 'text-[#85817D] hover:bg-white/70 hover:text-[#33312F]'
            )}
            title={isFavorite ? 'Unfavorite entry' : 'Favorite entry'}
          >
            <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
          </button>

          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-[#85817D] bg-white/70 px-2.5 py-1 rounded-xl border border-black/5 font-mono">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[#85817D]">
                <RotateCw className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[#283824]">
                <CheckCircle2 className="w-3 h-3 text-[#283824]" />
                <span className="hidden sm:inline">Saved {lastSavedTime}</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-rose-600 font-semibold">Error saving</span>
            )}
            {saveStatus === 'idle' && (
              <span className="text-[#85817D]">
                <CloudCheck className="w-3 h-3 inline mr-1" />
                {lastSavedTime ? `Saved ${lastSavedTime}` : 'Autosave active'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 p-6 sm:p-10 space-y-4">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Reflection Title..."
            className="w-full text-2xl sm:text-3xl font-bold tracking-tight bg-transparent border-none outline-none text-[#33312F] placeholder:text-[#85817D]/50"
          />
        </div>

        {/* Prompt Question Area (if present) */}
        {promptQuestion && (
          <div className="p-3.5 rounded-2xl bg-white/70 border border-black/5 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-[#442A20]">
              <span className="font-semibold block mb-0.5">Mindful Prompt:</span>
              <span className="italic leading-relaxed">&ldquo;{promptQuestion}&rdquo;</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPromptQuestion(null)
                performSave({ promptQuestion: null })
              }}
              className="text-[11px] text-[#85817D] hover:text-[#33312F] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Formatting Toolbar */}
        <div className="bg-white/80 border border-black/5 rounded-2xl p-1 shadow-2xs backdrop-blur-xs sticky top-2 z-10">
          <EditorToolbar editor={editor} />
        </div>

        {/* TipTap Rich Editor */}
        <div className="pt-2">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Bottom Emotion Chips Footer */}
      <div className="px-6 sm:px-10 py-3.5 border-t border-black/8 bg-white/40 rounded-b-3xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#85817D] flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Resonance:
          </span>
          {COMMON_EMOTION_TAGS.map((tag) => {
            const isSelected = emotions.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleEmotion(tag)}
                className={cn(
                  'px-2 py-0.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                  isSelected
                    ? 'bg-[#33312F] text-white border-[#33312F]'
                    : 'bg-white/60 border-black/5 text-[#605D58] hover:bg-white'
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <div className="text-[11px] text-[#85817D]">
          Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-black/10">⌘S</kbd> to save immediately
        </div>
      </div>
    </div>
  )
}
