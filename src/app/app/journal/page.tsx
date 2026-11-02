'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Calendar,
  Sparkles,
  BarChart2,
  LayoutGrid,
  List,
  Database,
} from 'lucide-react'
import {
  JournalEntry,
  MoodLog,
  MoodLevel,
  JournalFilter,
  JournalSort,
  JournalViewMode,
  JournalTemplate,
  JournalEntryCreateInput,
  MoodLogInput,
  MOOD_DEFINITIONS,
} from '@/types/journal'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { useToast } from '@/components/ui/toast'
import { JournalCard } from '@/components/modules/journal/journal-card'
import { JournalListRow } from '@/components/modules/journal/journal-list-row'
import { JournalEditor } from '@/components/modules/journal/journal-editor'
import { MoodSelector } from '@/components/modules/journal/mood-selector'
import { MoodCalendar } from '@/components/modules/journal/mood-calendar'
import { ReflectionStudioModal } from '@/components/modules/journal/reflection-studio-modal'
import { JournalTemplateModal } from '@/components/modules/journal/journal-template-modal'
import { JournalAnalytics } from '@/components/modules/journal/journal-analytics'
import {
  getLocalJournalEntries,
  saveLocalJournalEntries,
  getLocalMoodLogs,
  saveLocalMoodLogs,
  saveTodayMoodLog,
} from '@/lib/workspace/store'
import {
  getJournalData,
  createJournalEntryAction,
  updateJournalEntryAction,
  deleteJournalEntryAction,
  toggleFavoriteJournalAction,
  logMoodAction,
} from './actions'
import { formatLocalDate } from '@/lib/habits/streaks'
import { cn } from '@/lib/utils'

export default function JournalPage() {
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  // State
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Current Active Entry for Editing
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null)

  // Filters & Views
  const [filter, setFilter] = useState<JournalFilter>('all')
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<MoodLevel | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<JournalViewMode>('grid')
  const [sortBy, setSortBy] = useState<JournalSort>('newest')

  // Panes Toggle
  const [showMoodTracker, setShowMoodTracker] = useState(false)
  const [showMoodCalendar, setShowMoodCalendar] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Modals
  const [isReflectionStudioOpen, setIsReflectionStudioOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  // Calendar selected date
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('2026-11-01')
  const [todayStr, setTodayStr] = useState<string>('2026-11-01')

  useEffect(() => {
    const now = formatLocalDate(new Date())
    setTodayStr(now)
    setSelectedCalendarDate(now)
  }, [])

  // Initial Load
  useEffect(() => {
    async function load() {
      try {
        const res = await getJournalData()
        setIsConfigured(res.isConfigured)

        if (res.isAuthenticated) {
          setEntries(res.entries)
          setMoodLogs(res.moodLogs)
        } else {
          setEntries(getLocalJournalEntries())
          setMoodLogs(getLocalMoodLogs())
        }
      } catch {
        setEntries(getLocalJournalEntries())
        setMoodLogs(getLocalMoodLogs())
      } finally {
        setIsLoaded(true)
      }
    }
    load()
  }, [])

  // Sync to local storage if offline/preview
  useEffect(() => {
    if (isLoaded && !isConfigured) {
      saveLocalJournalEntries(entries)
      saveLocalMoodLogs(moodLogs)
    }
  }, [entries, moodLogs, isLoaded, isConfigured])

  // Today's mood log
  const todayMood = useMemo(() => {
    return moodLogs.find((m) => m.logDate === todayStr) || null
  }, [moodLogs, todayStr])

  // Selected date mood log
  const selectedDateMood = useMemo(() => {
    return moodLogs.find((m) => m.logDate === selectedCalendarDate) || null
  }, [moodLogs, selectedCalendarDate])

  // Filtered & Sorted Entries
  const filteredEntries = useMemo(() => {
    const result = entries.filter((entry) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = entry.title.toLowerCase().includes(q)
        const matchContent = entry.content.toLowerCase().includes(q)
        const matchTags = entry.tags.some((t) => t.toLowerCase().includes(q))
        const matchEmotions = entry.emotions.some((e) => e.toLowerCase().includes(q))
        if (!matchTitle && !matchContent && !matchTags && !matchEmotions) return false
      }

      // 2. Filter Status
      if (filter === 'favorites' && !entry.isFavorite) return false
      if (filter === 'today' && entry.entryDate !== todayStr) return false

      // 3. Mood Filter
      if (selectedMoodFilter !== 'all' && entry.moodLevel !== selectedMoodFilter) {
        return false
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateCompare = b.entryDate.localeCompare(a.entryDate)
        if (dateCompare !== 0) return dateCompare
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'oldest') {
        const dateCompare = a.entryDate.localeCompare(b.entryDate)
        if (dateCompare !== 0) return dateCompare
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    return result
  }, [entries, searchQuery, filter, selectedMoodFilter, sortBy, todayStr])

  // Counts
  const counts = useMemo(() => {
    const total = entries.length
    const favorites = entries.filter((e) => e.isFavorite).length
    const todayCount = entries.filter((e) => e.entryDate === todayStr).length
    return { total, favorites, todayCount }
  }, [entries, todayStr])

  // Handlers
  async function handleCreateNewEntry(initialInput?: Partial<JournalEntryCreateInput>) {
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      userId: 'default-user',
      entryDate: initialInput?.entryDate || todayStr,
      title: initialInput?.title || 'Untitled Reflection',
      content: initialInput?.content || '',
      contentJson: initialInput?.contentJson || null,
      moodLevel: initialInput?.moodLevel || todayMood?.moodLevel || null,
      emotions: initialInput?.emotions || todayMood?.emotions || [],
      tags: initialInput?.tags || [],
      isFavorite: Boolean(initialInput?.isFavorite),
      colorTheme: initialInput?.colorTheme || 'peach',
      templateId: initialInput?.templateId || null,
      linkedNoteIds: initialInput?.linkedNoteIds || [],
      gratitudeItems: initialInput?.gratitudeItems || [],
      promptQuestion: initialInput?.promptQuestion || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setEntries((prev) => [newEntry, ...prev])
    setActiveEntry(newEntry)

    if (isConfigured) {
      startTransition(async () => {
        await createJournalEntryAction({
          entryDate: newEntry.entryDate,
          title: newEntry.title,
          content: newEntry.content,
          moodLevel: newEntry.moodLevel,
          emotions: newEntry.emotions,
          tags: newEntry.tags,
          isFavorite: newEntry.isFavorite,
          colorTheme: newEntry.colorTheme,
          templateId: newEntry.templateId,
          linkedNoteIds: newEntry.linkedNoteIds,
          gratitudeItems: newEntry.gratitudeItems,
          promptQuestion: newEntry.promptQuestion,
        })
      })
    }
  }

  async function handleSaveActiveEntry(updatedData: Partial<JournalEntry>) {
    if (!activeEntry) return

    const updatedEntry: JournalEntry = {
      ...activeEntry,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    }

    setEntries((prev) =>
      prev.map((e) => (e.id === activeEntry.id ? updatedEntry : e))
    )
    setActiveEntry(updatedEntry)

    if (isConfigured) {
      await updateJournalEntryAction(activeEntry.id, {
        entryDate: updatedEntry.entryDate,
        title: updatedEntry.title,
        content: updatedEntry.content,
        contentJson: updatedEntry.contentJson,
        moodLevel: updatedEntry.moodLevel,
        emotions: updatedEntry.emotions,
        tags: updatedEntry.tags,
        isFavorite: updatedEntry.isFavorite,
        colorTheme: updatedEntry.colorTheme,
        templateId: updatedEntry.templateId,
        linkedNoteIds: updatedEntry.linkedNoteIds,
        gratitudeItems: updatedEntry.gratitudeItems,
        promptQuestion: updatedEntry.promptQuestion,
      })
    }
  }

  async function handleDeleteEntry(id: string) {
    const target = entries.find((e) => e.id === id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (activeEntry?.id === id) {
      setActiveEntry(null)
    }

    toast({
      title: 'Entry deleted',
      description: target ? `"${target.title}" was removed.` : 'Entry removed.',
      variant: 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await deleteJournalEntryAction(id)
      })
    }
  }

  async function handleToggleFavorite(id: string, isFavorite: boolean) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite } : e))
    )

    toast({
      title: isFavorite ? 'Added to favorites' : 'Removed from favorites',
      variant: 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await toggleFavoriteJournalAction(id, isFavorite)
      })
    }
  }

  async function handleSaveMood(input: MoodLogInput) {
    const existingIndex = moodLogs.findIndex((m) => m.logDate === input.logDate)
    const newLog: MoodLog = {
      id: existingIndex >= 0 ? moodLogs[existingIndex].id : `mood-${Date.now()}`,
      userId: 'default-user',
      logDate: input.logDate,
      moodScore: input.moodScore,
      moodLevel: input.moodLevel,
      emotions: input.emotions || [],
      note: input.note || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let updatedLogs: MoodLog[]
    if (existingIndex >= 0) {
      updatedLogs = moodLogs.map((m, idx) => (idx === existingIndex ? newLog : m))
    } else {
      updatedLogs = [newLog, ...moodLogs]
    }

    setMoodLogs(updatedLogs)
    saveTodayMoodLog(newLog)
    setShowMoodTracker(false)

    const def = MOOD_DEFINITIONS[input.moodLevel]
    toast({
      title: `Mood Recorded: ${def.emoji} ${def.label}`,
      description: input.emotions?.length
        ? `Resonance: ${input.emotions.join(', ')}`
        : 'Daily mood saved for today.',
      variant: 'success',
    })

    if (isConfigured) {
      startTransition(async () => {
        await logMoodAction(input)
      })
    }
  }

  function handleSelectTemplate(template: JournalTemplate) {
    handleCreateNewEntry({
      title: template.defaultTitle,
      content: template.contentHtml,
      colorTheme: template.colorTheme,
      templateId: template.id,
      promptQuestion: template.promptQuestion,
      emotions: template.defaultEmotions || [],
    })
  }

  // If writing in the editor, display full-screen dedicated editor
  if (activeEntry) {
    return (
      <div className="py-2 animate-fadeIn">
        <JournalEditor
          entry={activeEntry}
          onSave={handleSaveActiveEntry}
          onClose={() => setActiveEntry(null)}
          isConfigured={isConfigured}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Offline Banner */}
      {!isConfigured && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#F4EBD5]/60 border border-[#E7DCBE] text-xs text-[#7A6332]">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>
              Preview Mode: Journal entries and mood records are preserved in local storage. Connect Supabase in{' '}
              <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-[11px]">.env.local</code> for cloud synchronization.
            </span>
          </div>
          <PastelBadge variant="buttercream" size="sm">
            Local Storage
          </PastelBadge>
        </div>
      )}

      {/* Header */}
      <SectionHeader
        title="Mindful Journal"
        description="A private, distraction-free sanctuary for daily reflections, mood tracking, and mindful prompts."
        badge={
          todayMood ? (
            <span
              onClick={() => setShowMoodTracker(true)}
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer select-none transition-transform hover:scale-105',
                MOOD_DEFINITIONS[todayMood.moodLevel].badgeClass
              )}
              title="Click to adjust today's mood"
            >
              <span>{MOOD_DEFINITIONS[todayMood.moodLevel].emoji}</span>
              <span>{MOOD_DEFINITIONS[todayMood.moodLevel].label}</span>
              <span className="text-[10px] opacity-75">· Today</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowMoodTracker(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#E8E6DF] text-[#7A6332] hover:bg-[#F4EBD5] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Log Today&apos;s Mood</span>
            </button>
          )
        }
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BookOpen className="w-3.5 h-3.5 text-[#4B3968]" />}
              onClick={() => setIsReflectionStudioOpen(true)}
            >
              Reflection Studio
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#7A6332]" />}
              onClick={() => setIsTemplateModalOpen(true)}
            >
              Templates
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => handleCreateNewEntry()}
            >
              New Entry
            </Button>
          </div>
        }
      />

      {/* Mood Logging Pane (Toggled) */}
      {showMoodTracker && (
        <div className="animate-fadeIn">
          <MoodSelector
            initialMoodLog={selectedDateMood || todayMood}
            selectedDate={selectedCalendarDate}
            onSaveMood={handleSaveMood}
            onCancel={() => setShowMoodTracker(false)}
          />
        </div>
      )}

      {/* Top Controls: Search, Filters, Mood Calendar Toggle, Analytics Toggle, View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#85817D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries, emotions, tags..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] placeholder:text-[#85817D] outline-none focus:border-[#33312F]"
          />
        </div>

        {/* Action Toggles: Mood Calendar, Analytics, View Mode */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Mood Calendar Toggle */}
          <Button
            variant={showMoodCalendar ? 'secondary' : 'outline'}
            size="sm"
            leftIcon={<Calendar className="w-3.5 h-3.5 text-[#1E3345]" />}
            onClick={() => setShowMoodCalendar(!showMoodCalendar)}
          >
            Mood Calendar
          </Button>

          {/* Analytics Toggle */}
          <Button
            variant={showAnalytics ? 'secondary' : 'outline'}
            size="sm"
            leftIcon={<BarChart2 className="w-3.5 h-3.5 text-[#283824]" />}
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            Analytics
          </Button>

          {/* View Mode Switcher */}
          <div className="flex items-center border border-[#E8E6DF] rounded-xl bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[#FAF9F6] text-[#33312F] shadow-2xs font-bold'
                  : 'text-[#85817D] hover:text-[#33312F]'
              )}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'list'
                  ? 'bg-[#FAF9F6] text-[#33312F] shadow-2xs font-bold'
                  : 'text-[#85817D] hover:text-[#33312F]'
              )}
              title="Chronological List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mood Calendar Pane (When active) */}
      {showMoodCalendar && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          <div className="md:col-span-2">
            <MoodCalendar
              moodLogs={moodLogs}
              selectedDate={selectedCalendarDate}
              onSelectDate={(d) => {
                setSelectedCalendarDate(d)
                setShowMoodTracker(true)
              }}
            />
          </div>
          <div>
            <MoodSelector
              initialMoodLog={selectedDateMood}
              selectedDate={selectedCalendarDate}
              onSaveMood={handleSaveMood}
              compact
            />
          </div>
        </div>
      )}

      {/* Analytics Pane (When active) */}
      {showAnalytics && (
        <div className="animate-fadeIn">
          <JournalAnalytics entries={entries} moodLogs={moodLogs} />
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border',
              filter === 'all'
                ? 'bg-[#33312F] text-white border-[#33312F] shadow-xs'
                : 'bg-white text-[#85817D] border-[#E8E6DF] hover:border-[#D1CEBF] hover:text-[#33312F]'
            )}
          >
            All Reflections ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setFilter('favorites')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1',
              filter === 'favorites'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold shadow-xs'
                : 'bg-white text-[#85817D] border-[#E8E6DF] hover:border-[#D1CEBF] hover:text-[#33312F]'
            )}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Favorites</span>
            <span className="text-[11px] px-1 rounded-full bg-white/70">
              {counts.favorites}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('today')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1',
              filter === 'today'
                ? 'bg-[#F4E4DC] text-[#442A20] border-[#E8D4CA] font-semibold shadow-xs'
                : 'bg-white text-[#85817D] border-[#E8E6DF] hover:border-[#D1CEBF] hover:text-[#33312F]'
            )}
          >
            <span>Today</span>
            <span className="text-[11px] px-1 rounded-full bg-white/70">
              {counts.todayCount}
            </span>
          </button>
        </div>

        {/* Filter by Mood Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMoodFilter}
            onChange={(e) => setSelectedMoodFilter(e.target.value as MoodLevel | 'all')}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] outline-none"
          >
            <option value="all">All Moods</option>
            <option value="excellent">✨ Excellent</option>
            <option value="good">🌿 Good</option>
            <option value="neutral">🌤️ Neutral</option>
            <option value="low">☁️ Low</option>
            <option value="very_low">🌧️ Very Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as JournalSort)}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Main Journal Feed */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-[20px] bg-white border border-[#E8E6DF] p-8 sm:p-12 shadow-xs">
          <EmptyState
            color="peach"
            icon={<BookOpen className="w-6 h-6 text-[#442A20]" />}
            title={
              filter === 'favorites'
                ? 'No favorite reflections yet'
                : searchQuery
                ? 'No reflections matched your search'
                : 'Your journal is ready for your thoughts'
            }
            description="Capture moments of gratitude, daily observations, or thoughtful synthesis in your personal diary."
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  onClick={() => setIsTemplateModalOpen(true)}
                >
                  Choose Template
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => handleCreateNewEntry()}
                >
                  New Reflection
                </Button>
              </div>
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onOpen={(e) => setActiveEntry(e)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteEntry}
              todayDateStr={todayStr}
            />
          ))}
        </div>
      ) : (
        /* Compact Chronological List View */
        <div className="space-y-2">
          {filteredEntries.map((entry) => (
            <JournalListRow
              key={entry.id}
              entry={entry}
              onOpen={(e) => setActiveEntry(e)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteEntry}
              todayDateStr={todayStr}
            />
          ))}
        </div>
      )}

      {/* Reflection Studio Modal */}
      <ReflectionStudioModal
        isOpen={isReflectionStudioOpen}
        onClose={() => setIsReflectionStudioOpen(false)}
        onCompleteReflection={(input) => handleCreateNewEntry(input)}
        currentDateStr={todayStr}
      />

      {/* Template Chooser Modal */}
      <JournalTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  )
}
