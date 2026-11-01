'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import Link from 'next/link'
import {
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Check,
  Calendar as CalendarIcon,
  Database,
  CheckSquare,
  Sparkles,
  Edit2,
  Trash2,
  BookOpen,
} from 'lucide-react'
import { DailyPlan, TimeBlock, TimeBlockCreateInput, TimeBlockUpdateInput, DailyReflection } from '@/types/planner'
import { Task } from '@/types/tasks'
import { PastelColorKey } from '@/lib/constants/colors'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { useToast } from '@/components/ui/toast'
import { TimeBlockModal } from '@/components/modules/planner/time-block-modal'
import { DailyReflectionModal } from '@/components/modules/planner/daily-reflection-modal'
import {
  getLocalDailyPlan,
  saveLocalDailyPlan,
  getLocalTimeBlocks,
  saveLocalTimeBlocks,
  getLocalTasks,
} from '@/lib/workspace/store'
import {
  getDailyPlanData,
  updateDailyIntentionAction,
  updateDailyReflectionAction,
  createTimeBlockAction,
  updateTimeBlockAction,
  deleteTimeBlockAction,
} from './actions'
import { formatLocalDate } from '@/lib/habits/streaks'
import { cn } from '@/lib/utils'

const HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
]

const PASTEL_THEMES: Partial<
  Record<PastelColorKey, { bg: string; border: string; text: string }>
> = {
  powder: { bg: 'bg-[#DFEAF2]', border: 'border-[#CBDDE9]', text: 'text-[#1E3345]' },
  sage: { bg: 'bg-[#E3EBDD]', border: 'border-[#CCD9C3]', text: 'text-[#283824]' },
  buttercream: { bg: 'bg-[#F4EBD5]', border: 'border-[#E5D7B7]', text: 'text-[#42361D]' },
  peach: { bg: 'bg-[#F4E4DC]', border: 'border-[#E7D0C4]', text: 'text-[#442A20]' },
  lavender: { bg: 'bg-[#E8E1F4]', border: 'border-[#D5CBE5]', text: 'text-[#4B3968]' },
  pink: { bg: 'bg-[#F0DFE8]', border: 'border-[#DFC6D4]', text: 'text-[#552744]' },
}

export default function CalendarPage() {
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  // Selected Date and Current Today
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-01')
  const [todayStr, setTodayStr] = useState<string>('2026-11-01')

  useEffect(() => {
    const nowStr = formatLocalDate(new Date())
    setTodayStr(nowStr)
    setSelectedDate(nowStr)
  }, [])

  // State
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Intention edit state
  const [intentionText, setIntentionText] = useState('')
  const [isEditingIntention, setIsEditingIntention] = useState(false)

  // Modals
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null)
  const [preselectedStartTime, setPreselectedStartTime] = useState<string | null>(null)
  const [preselectedTaskId, setPreselectedTaskId] = useState<string | null>(null)

  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false)

  const isSelectedDateToday = selectedDate === todayStr

  // Format date display
  const dateHeading = useMemo(() => {
    try {
      const parts = selectedDate.split('-').map(Number)
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return selectedDate
    }
  }, [selectedDate])

  // Load data for date
  useEffect(() => {
    async function load() {
      try {
        const res = await getDailyPlanData(selectedDate)
        setIsConfigured(res.isConfigured)

        if (res.isConfigured && res.dailyPlan) {
          setDailyPlan(res.dailyPlan)
          setTimeBlocks(res.timeBlocks)
          setIntentionText(res.dailyPlan.morningIntention || '')
        } else {
          // Fallback to local storage
          const localPlan = getLocalDailyPlan()
          const allBlocks = getLocalTimeBlocks()
          const dayBlocks = allBlocks.filter((b) => b.blockDate === selectedDate)

          if (localPlan && localPlan.planDate === selectedDate) {
            setDailyPlan(localPlan)
            setIntentionText(localPlan.morningIntention || '')
          } else {
            const fallbackPlan: DailyPlan = {
              id: `plan-${selectedDate}`,
              userId: 'default-user',
              planDate: selectedDate,
              morningIntention: isSelectedDateToday
                ? 'Direct high-impact energy into focused deep work and mindful habit consistency.'
                : '',
              dailyReflection: null,
              timeBlocks: dayBlocks,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            setDailyPlan(fallbackPlan)
            setIntentionText(fallbackPlan.morningIntention || '')
          }
          setTimeBlocks(dayBlocks)
        }
      } catch {
        const allBlocks = getLocalTimeBlocks()
        setTimeBlocks(allBlocks.filter((b) => b.blockDate === selectedDate))
      } finally {
        setTasks(getLocalTasks())
        setIsLoaded(true)
      }
    }
    load()
  }, [selectedDate, isSelectedDateToday])

  // Sync to local storage
  useEffect(() => {
    if (isLoaded && !isConfigured && dailyPlan) {
      saveLocalDailyPlan(dailyPlan)
      const allBlocks = getLocalTimeBlocks()
      const otherBlocks = allBlocks.filter((b) => b.blockDate !== selectedDate)
      saveLocalTimeBlocks([...otherBlocks, ...timeBlocks])
    }
  }, [dailyPlan, timeBlocks, isLoaded, isConfigured, selectedDate])

  // Date Navigation
  function navigateDay(offset: number) {
    const parts = selectedDate.split('-').map(Number)
    const current = new Date(parts[0], parts[1] - 1, parts[2])
    current.setDate(current.getDate() + offset)
    setSelectedDate(formatLocalDate(current))
  }

  // Handlers for Intention
  async function handleSaveIntention() {
    setIsEditingIntention(false)
    if (dailyPlan) {
      setDailyPlan({
        ...dailyPlan,
        morningIntention: intentionText.trim(),
        updatedAt: new Date().toISOString(),
      })
    }

    toast({
      title: 'Daily Intention set',
      description: 'Your morning intention guides today’s timeline.',
      variant: 'success',
    })

    if (isConfigured) {
      startTransition(async () => {
        await updateDailyIntentionAction(selectedDate, intentionText.trim())
      })
    }
  }

  // Handlers for Reflection
  async function handleSaveReflection(reflection: DailyReflection, eveningText: string) {
    if (dailyPlan) {
      setDailyPlan({
        ...dailyPlan,
        dailyReflection: reflection,
        eveningReflection: eveningText,
        updatedAt: new Date().toISOString(),
      })
    }

    toast({
      title: 'Evening Reflection saved ✨',
      description: 'Mindful review recorded. Rest well!',
      variant: 'success',
    })

    if (isConfigured) {
      startTransition(async () => {
        await updateDailyReflectionAction(selectedDate, reflection)
      })
    }
  }

  // Handlers for Time Blocks
  async function handleCreateTimeBlock(input: TimeBlockCreateInput) {
    const newBlock: TimeBlock = {
      id: `tb-${Date.now()}`,
      userId: 'default-user',
      title: input.title,
      blockDate: input.blockDate,
      startTime: input.startTime,
      endTime: input.endTime,
      colorTheme: input.colorTheme || 'powder',
      taskId: input.taskId || null,
      notes: input.notes || null,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }

    if (input.blockDate === selectedDate) {
      setTimeBlocks((prev) => [...prev, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)))
    }

    toast({
      title: 'Time block scheduled',
      description: `${input.startTime} – ${input.endTime}: "${input.title}"`,
      variant: 'success',
    })

    if (isConfigured) {
      startTransition(async () => {
        await createTimeBlockAction(input)
      })
    }
  }

  async function handleUpdateTimeBlock(id: string, input: TimeBlockUpdateInput) {
    setTimeBlocks((prev) =>
      prev
        .map((b) => (b.id === id ? { ...b, ...input } : b))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    )

    toast({
      title: 'Time block updated',
      description: 'Timeline adjustments saved.',
      variant: 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await updateTimeBlockAction(id, input)
      })
    }
  }

  async function handleToggleCompleteBlock(block: TimeBlock) {
    const nextCompleted = !block.isCompleted
    setTimeBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? { ...b, isCompleted: nextCompleted } : b))
    )

    toast({
      title: nextCompleted ? 'Focus Block Completed' : 'Block reopened',
      description: `"${block.title}" marked as ${nextCompleted ? 'done' : 'incomplete'}.`,
      variant: nextCompleted ? 'success' : 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await updateTimeBlockAction(block.id, { isCompleted: nextCompleted })
      })
    }
  }

  async function handleDeleteTimeBlock(id: string) {
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id))

    toast({
      title: 'Time block removed',
      description: 'The block has been removed from your timeline.',
      variant: 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await deleteTimeBlockAction(id)
      })
    }
  }

  // Quick schedule from task tray
  function handleScheduleTask(task: Task) {
    setPreselectedTaskId(task.id)
    setPreselectedStartTime('11:00')
    setEditingBlock(null)
    setIsBlockModalOpen(true)
  }

  // Quick add on empty hour slot
  function handleSlotClick(hourStr: string) {
    setPreselectedStartTime(hourStr)
    setPreselectedTaskId(null)
    setEditingBlock(null)
    setIsBlockModalOpen(true)
  }

  // Filter uncompleted tasks for Tray
  const trayTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed').slice(0, 8)
  }, [tasks])

  const hasReflection = Boolean(
    dailyPlan?.dailyReflection?.whatWentWell ||
      dailyPlan?.dailyReflection?.whatAccomplished ||
      dailyPlan?.eveningReflection
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Offline Banner */}
      {!isConfigured && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#F4EBD5]/60 border border-[#E7DCBE] text-xs text-[#7A6332]">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>
              Preview Mode: Daily plans and time blocks are stored in local storage. Connect Supabase in{' '}
              <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-[11px]">.env.local</code> for cloud synchronization.
            </span>
          </div>
          <PastelBadge variant="buttercream" size="sm">
            Local Storage
          </PastelBadge>
        </div>
      )}

      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#33312F]">
              Daily Planner
            </h1>
            <PastelBadge variant="powder">
              {timeBlocks.length} Focus Blocks
            </PastelBadge>
          </div>
          <p className="text-sm text-[#85817D]">
            Set morning intentions, block out deep work hours, and reflect in the evening.
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border border-[#E8E6DF] rounded-xl bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => navigateDay(-1)}
              className="p-1.5 rounded-lg text-[#85817D] hover:text-[#33312F] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer',
                isSelectedDateToday
                  ? 'bg-[#FAF9F6] text-[#33312F]'
                  : 'text-[#85817D] hover:text-[#33312F]'
              )}
            >
              {isSelectedDateToday ? 'Today' : 'Jump to Today'}
            </button>
            <button
              type="button"
              onClick={() => navigateDay(1)}
              className="p-1.5 rounded-lg text-[#85817D] hover:text-[#33312F] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link href="/app/journal">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BookOpen className="w-3.5 h-3.5 text-[#7A281E]" />}
            >
              Journal
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Moon className="w-3.5 h-3.5 text-[#4B3968]" />}
            onClick={() => setIsReflectionModalOpen(true)}
          >
            {hasReflection ? 'Reflected ✨' : 'Daily Review'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setPreselectedStartTime('09:00')
              setPreselectedTaskId(null)
              setEditingBlock(null)
              setIsBlockModalOpen(true)
            }}
          >
            Block Time
          </Button>
        </div>
      </div>

      {/* Date Title Banner & Morning Intention Sticky Note */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#85817D] uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 text-[#1E3345]" />
            Timeline Date
          </div>
          <div className="text-lg font-bold text-[#33312F] pt-2">
            {dateHeading}
          </div>
          <div className="text-xs text-[#85817D] pt-1">
            {isSelectedDateToday ? 'Current Day in Progress' : 'Archive / Planned Schedule'}
          </div>
        </div>

        {/* Morning Intention Sticky Note */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-[#F4EBD5] border border-[#E5D7B7] relative flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#7A6332] uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-700" />
              Today&apos;s Guiding Intention
            </span>
            <button
              type="button"
              onClick={() => setIsEditingIntention(!isEditingIntention)}
              className="text-xs text-[#7A6332] hover:text-[#42361D] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              {isEditingIntention ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingIntention ? (
            <div className="space-y-2 mt-1">
              <input
                type="text"
                value={intentionText}
                onChange={(e) => setIntentionText(e.target.value)}
                placeholder="What single focus matters most today?"
                className="w-full text-xs px-3 py-2 rounded-xl bg-white/90 border border-[#E5D7B7] text-[#33312F] outline-none"
                autoFocus
              />
              <div className="flex justify-end">
                <Button size="sm" variant="primary" onClick={handleSaveIntention}>
                  Save Intention
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-[#42361D] italic leading-relaxed">
              &ldquo;{dailyPlan?.morningIntention || 'Set an intentional focus for your day...'}&rdquo;
            </p>
          )}

          <div className="text-[11px] text-[#7A6332]/80 pt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Keep this central guiding thought in mind throughout your schedule.
          </div>
        </div>
      </div>

      {/* Main Grid: Hourly Timeline + Task Tray Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Timeline (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E8E6DF] p-4 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E6DF]">
            <h2 className="text-sm font-bold text-[#33312F] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#85817D]" />
              Schedule &amp; Focus Blocks
            </h2>
            <span className="text-xs text-[#85817D]">
              Click any hour slot to add a block
            </span>
          </div>

          {/* Hourly Slots */}
          <div className="space-y-2">
            {HOURS.map((hour) => {
              const blocksInHour = timeBlocks.filter(
                (b) => b.startTime.startsWith(hour.slice(0, 2))
              )

              return (
                <div
                  key={hour}
                  className="flex items-start gap-3 group/slot min-h-[50px] py-1 border-b border-[#FAF9F6]"
                >
                  {/* Hour Marker */}
                  <div className="w-14 text-right text-xs font-mono text-[#85817D] pt-1 shrink-0 select-none">
                    {hour}
                  </div>

                  {/* Slot Container */}
                  <div className="flex-1 space-y-1.5">
                    {blocksInHour.length > 0 ? (
                      blocksInHour.map((block) => {
                        const theme = PASTEL_THEMES[block.colorTheme] || PASTEL_THEMES.powder!
                        return (
                          <div
                            key={block.id}
                            className={cn(
                              'group relative p-3 rounded-xl border transition-all duration-150 flex items-start justify-between gap-3',
                              theme.bg,
                              theme.border,
                              block.isCompleted && 'opacity-60'
                            )}
                          >
                            {/* Checkbox and Info */}
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleToggleCompleteBlock(block)}
                                className={cn(
                                  'mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0',
                                  block.isCompleted
                                    ? 'bg-[#33312F] border-[#33312F] text-white'
                                    : 'border-[#85817D] bg-white hover:border-[#33312F]'
                                )}
                                aria-label="Mark block complete"
                              >
                                {block.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={cn(
                                      'text-xs font-semibold tracking-tight text-[#33312F]',
                                      block.isCompleted && 'line-through text-[#85817D]'
                                    )}
                                  >
                                    {block.title}
                                  </span>
                                  <span className="text-[11px] font-mono text-[#605D58] bg-white/60 px-1.5 py-0.5 rounded">
                                    {block.startTime} – {block.endTime}
                                  </span>
                                </div>

                                {block.notes && (
                                  <p className="text-[11px] text-[#605D58] line-clamp-1 mt-0.5">
                                    {block.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBlock(block)
                                  setIsBlockModalOpen(true)
                                }}
                                className="p-1 rounded text-[#605D58] hover:bg-white/80 transition-colors cursor-pointer"
                                title="Edit block"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTimeBlock(block.id)}
                                className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete block"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      /* Empty slot placeholder click target */
                      <button
                        type="button"
                        onClick={() => handleSlotClick(hour)}
                        className="w-full h-8 rounded-lg border border-dashed border-transparent hover:border-[#D1CEBF] hover:bg-[#FAF9F6] flex items-center justify-start px-3 text-xs text-[#85817D] opacity-0 group-hover/slot:opacity-100 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3 mr-1 text-[#85817D]" />
                        <span>Reserve {hour} slot...</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Task Tray Sidebar (1 Column) */}
        <div className="rounded-2xl bg-white border border-[#E8E6DF] p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E6DF]">
            <h2 className="text-sm font-bold text-[#33312F] flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-[#85817D]" />
              Task Tray
            </h2>
            <span className="text-xs text-[#85817D]">
              {trayTasks.length} unassigned
            </span>
          </div>

          <p className="text-xs text-[#85817D] leading-relaxed">
            Click <strong>+ Schedule</strong> to place any pending action item into your daily timeline.
          </p>

          <div className="space-y-2">
            {trayTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#85817D] bg-[#FAF9F6] rounded-xl border border-[#E8E6DF]">
                All pending tasks are scheduled or complete!
              </div>
            ) : (
              trayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF] hover:border-[#D1CEBF] transition-all space-y-1.5 group/tray"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-[#33312F] line-clamp-2">
                      {task.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleScheduleTask(task)}
                      className="shrink-0 text-[11px] font-semibold text-[#1E3345] bg-[#DFEAF2] hover:bg-[#CBDDE9] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      + Schedule
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#85817D]">
                    <span className="capitalize font-medium">
                      {task.priority}
                    </span>
                    {task.project && (
                      <span className="px-1.5 py-0.2 rounded bg-white border border-[#E8E6DF]">
                        #{task.project}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Time Block Modal */}
      <TimeBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => {
          setIsBlockModalOpen(false)
          setEditingBlock(null)
          setPreselectedTaskId(null)
          setPreselectedStartTime(null)
        }}
        selectedDate={selectedDate}
        tasks={tasks}
        onCreateTimeBlock={handleCreateTimeBlock}
        initialBlock={editingBlock}
        onUpdateTimeBlock={handleUpdateTimeBlock}
        preselectedTaskId={preselectedTaskId}
        preselectedStartTime={preselectedStartTime}
      />

      {/* Daily Reflection Modal */}
      <DailyReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
        dateStr={selectedDate}
        initialReflection={dailyPlan?.dailyReflection}
        initialEveningReflection={dailyPlan?.eveningReflection}
        onSaveReflection={handleSaveReflection}
      />
    </div>
  )
}
