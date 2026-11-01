'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  StickyNote,
  Flame,
  CheckSquare,
  Target,
  Calendar,
  BookOpen,
  Sparkles,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  Command,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils/styling'

interface CommandItem {
  id: string
  label: string
  group: 'Navigation' | 'Actions'
  icon: React.ReactNode
  path?: string
  action?: () => void
  disabled?: boolean
  badge?: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-home',
        label: 'Go to Workspace Desk',
        group: 'Navigation',
        icon: <Command className="w-4 h-4 text-[#85817D]" />,
        path: '/app',
      },
      {
        id: 'nav-notes',
        label: 'Go to Intelligent Notes',
        group: 'Navigation',
        icon: <StickyNote className="w-4 h-4 text-[#B58525]" />,
        path: '/app/notes',
      },
      {
        id: 'nav-habits',
        label: 'Go to Habits & Streaks',
        group: 'Navigation',
        icon: <Flame className="w-4 h-4 text-[#C95D4A]" />,
        path: '/app/habits',
      },
      {
        id: 'nav-tasks',
        label: 'Go to Tasks',
        group: 'Navigation',
        icon: <CheckSquare className="w-4 h-4 text-[#3D7535]" />,
        path: '/app/tasks',
      },
      {
        id: 'nav-goals',
        label: 'Go to Goals',
        group: 'Navigation',
        icon: <Target className="w-4 h-4 text-[#213545]" />,
        path: '/app/goals',
      },
      {
        id: 'nav-calendar',
        label: 'Go to Daily Planner & Calendar',
        group: 'Navigation',
        icon: <Calendar className="w-4 h-4 text-[#213545]" />,
        path: '/app/calendar',
      },
      {
        id: 'nav-journal',
        label: 'Go to Mindful Journal',
        group: 'Navigation',
        icon: <BookOpen className="w-4 h-4 text-[#5B3E8C]" />,
        path: '/app/journal',
      },
      {
        id: 'nav-ai',
        label: 'Go to Gemini AI Companion',
        group: 'Navigation',
        icon: <Sparkles className="w-4 h-4 text-[#5B3E8C]" />,
        path: '/app/ai',
      },
      {
        id: 'nav-insights',
        label: 'Go to Workspace Insights',
        group: 'Navigation',
        icon: <BarChart3 className="w-4 h-4 text-[#85817D]" />,
        path: '/app/insights',
      },
      {
        id: 'nav-settings',
        label: 'Go to Workspace Settings',
        group: 'Navigation',
        icon: <Settings className="w-4 h-4 text-[#85817D]" />,
        path: '/app/settings',
      },
      // Actions
      {
        id: 'act-new-note',
        label: 'Create a new pastel note',
        group: 'Actions',
        icon: <Plus className="w-4 h-4 text-[#B58525]" />,
        badge: 'Phase 03',
        action: () => {
          toast({
            title: 'Note Editor Available in Phase 03',
            description: 'The interactive sticky board and rich note editor will be integrated in Phase 03.',
            variant: 'pastel',
          })
          router.push('/app/notes')
        },
      },
      {
        id: 'act-new-task',
        label: 'Create a new task',
        group: 'Actions',
        icon: <Plus className="w-4 h-4 text-[#3D7535]" />,
        badge: 'Phase 04',
        action: () => {
          toast({
            title: 'Tasks Available in Phase 04',
            description: 'Task board, priority matrices, and goal tracking will be integrated in Phase 04.',
            variant: 'pastel',
          })
          router.push('/app/tasks')
        },
      },
      {
        id: 'act-new-habit',
        label: 'Create a new daily habit',
        group: 'Actions',
        icon: <Plus className="w-4 h-4 text-[#C95D4A]" />,
        badge: 'Phase 04',
        action: () => {
          toast({
            title: 'Habit Tracker Available in Phase 04',
            description: 'Habit streaks and consistency heatmaps will be integrated in Phase 04.',
            variant: 'pastel',
          })
          router.push('/app/habits')
        },
      },
    ],
    [router, toast]
  )

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands
    const query = search.toLowerCase()
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(query) ||
        c.group.toLowerCase().includes(query)
    )
  }, [commands, search])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => {
          if (!prev) {
            setSearch('')
            setSelectedIndex(0)
          }
          return !prev
        })
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    function handleCustomEvent() {
      setSearch('')
      setSelectedIndex(0)
      setIsOpen(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-command-palette', handleCustomEvent)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-command-palette', handleCustomEvent)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
      return () => clearTimeout(timer)
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  function handleSelect(cmd: CommandItem) {
    setIsOpen(false)
    if (cmd.action) {
      cmd.action()
    } else if (cmd.path) {
      router.push(cmd.path)
    }
  }

  function handleKeyNavigation(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex])
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#33312F]/20 backdrop-blur-xs"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white border border-[#EAE6DF] rounded-[20px] shadow-2xl overflow-hidden z-10"
          >
            {/* Input Row */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#EAE6DF]">
              <Search className="w-4 h-4 text-[#85817D] shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyNavigation}
                placeholder="Type a command or jump to a module..."
                className="w-full bg-transparent text-sm text-[#33312F] placeholder-[#AFAAA4] focus:outline-hidden"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[6px] bg-[#F5F2EB] border border-[#EAE6DF] text-[10px] text-[#85817D] font-mono">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#85817D]">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((cmd, index) => {
                  const isSelected = index === selectedIndex
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium transition-colors text-left cursor-pointer',
                        isSelected
                          ? 'bg-[#F5F2EB] text-[#33312F]'
                          : 'text-[#5C5956] hover:bg-[#FAF9F6]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="shrink-0">{cmd.icon}</span>
                        <span>{cmd.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cmd.badge && (
                          <span className="px-2 py-0.5 rounded-[6px] bg-[#E8E1F4] text-[#352749] text-[10px] font-medium border border-[#D8CEE8]">
                            {cmd.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-[#AFAAA4] uppercase tracking-wider">
                          {cmd.group}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#AFAAA4]" />
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-4 py-2 border-t border-[#EAE6DF] bg-[#FAF9F6] flex items-center justify-between text-[11px] text-[#85817D]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#EAE6DF] font-mono text-[9px]">
                    ↑↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#EAE6DF] font-mono text-[9px]">
                    ↵
                  </kbd>{' '}
                  Select
                </span>
              </div>
              <span>Notepad.ai Workspace</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
