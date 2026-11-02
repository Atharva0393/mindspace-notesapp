'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import {
  CheckSquare,
  Plus,
  Database,
  ArrowUpDown,
  Layers,
} from 'lucide-react'
import {
  Task,
  TaskFilter,
  TaskSort,
  TaskCreateInput,
  TaskUpdateInput,
  TaskPriority,
  Goal,
} from '@/types/tasks'
import { Note } from '@/types/notes'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { useToast } from '@/components/ui/toast'
import { TaskRow } from '@/components/modules/tasks/task-row'
import { CreateTaskModal } from '@/components/modules/tasks/create-task-modal'
import { getLocalTasks, saveLocalTasks, getLocalGoals } from '@/lib/workspace/store'
import { getLocalNotes } from '@/lib/notes/storage'
import {
  getTasksData,
  createTaskAction,
  completeTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from './actions'
import { createNextOccurrence } from '@/lib/tasks/recurrence'
import { formatLocalDate } from '@/lib/habits/streaks'
import { cn } from '@/lib/utils'

export default function TasksPage() {
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Filters & Sorting
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<TaskSort>('dueDate')
  const [groupByPriority, setGroupByPriority] = useState(false)

  // Quick Add input
  const [quickTitle, setQuickTitle] = useState('')

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [todayStr, setTodayStr] = useState('2026-11-01')

  // Initial Load
  useEffect(() => {
    setTodayStr(formatLocalDate(new Date()))
    async function load() {
      try {
        const res = await getTasksData()
        setIsConfigured(res.isConfigured)

        if (res.isAuthenticated) {
          setTasks(res.tasks)
        } else {
          setTasks(getLocalTasks())
        }
      } catch {
        setTasks(getLocalTasks())
      } finally {
        setGoals(getLocalGoals())
        setNotes(getLocalNotes())
        setIsLoaded(true)
      }
    }
    load()
  }, [])

  // Sync to local storage if offline/preview
  useEffect(() => {
    if (isLoaded && !isConfigured) {
      saveLocalTasks(tasks)
    }
  }, [tasks, isLoaded, isConfigured])

  // Extract distinct projects
  const projects = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach((t) => {
      if (t.project && t.project.trim()) {
        set.add(t.project.trim())
      }
    })
    return Array.from(set)
  }, [tasks])

  // Task Counts
  const counts = useMemo(() => {
    let all = 0
    let today = 0
    let upcoming = 0
    let overdue = 0
    let completed = 0

    tasks.forEach((t) => {
      if (t.status === 'completed') {
        completed++
      } else {
        all++
        if (t.dueDate === todayStr) today++
        else if (t.dueDate && t.dueDate > todayStr) upcoming++
        else if (t.dueDate && t.dueDate < todayStr) overdue++
      }
    })

    return { all, today, upcoming, overdue, completed }
  }, [tasks, todayStr])

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    const result = tasks.filter((t) => {
      // 1. Status / Date Filter
      if (filter === 'completed') {
        if (t.status !== 'completed') return false
      } else {
        if (t.status === 'completed') return false
        if (filter === 'today' && t.dueDate !== todayStr) return false
        if (filter === 'upcoming' && (!t.dueDate || t.dueDate <= todayStr)) return false
        if (filter === 'overdue' && (!t.dueDate || t.dueDate >= todayStr)) return false
      }

      // 2. Project Filter
      if (selectedProject && t.project !== selectedProject) {
        return false
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      }
      if (sortBy === 'priority') {
        const priorityRank: Record<TaskPriority, number> = {
          urgent: 0,
          high: 1,
          medium: 2,
          low: 3,
        }
        return priorityRank[a.priority] - priorityRank[b.priority]
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return 0
    })

    return result
  }, [tasks, filter, selectedProject, sortBy, todayStr])

  // Handlers
  async function handleToggleComplete(task: Task) {
    const isNowCompleted = task.status !== 'completed'
    const newStatus: Task['status'] = isNowCompleted ? 'completed' : 'todo'

    let nextOccurrenceTask: Task | null = null
    if (isNowCompleted && task.recurrence && task.recurrence !== 'none') {
      const nextInput = createNextOccurrence(task)
      if (nextInput) {
        nextOccurrenceTask = {
          id: `task-${Date.now()}`,
          userId: task.userId,
          title: nextInput.title || task.title,
          description: nextInput.description,
          priority: nextInput.priority || 'medium',
          status: 'todo',
          dueDate: nextInput.dueDate,
          dueTime: nextInput.dueTime,
          project: nextInput.project,
          tags: nextInput.tags || [],
          recurrence: nextInput.recurrence || 'none',
          goalId: nextInput.goalId,
          linkedNoteId: nextInput.linkedNoteId,
          isDailyFocus: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
    }

    setTasks((prev) => {
      const updated: Task[] = prev.map((t) =>
        t.id === task.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
      return nextOccurrenceTask ? [nextOccurrenceTask, ...updated] : updated
    })

    if (isNowCompleted) {
      if (nextOccurrenceTask) {
        toast({
          title: 'Task completed & repeated',
          description: `Next occurrence scheduled for ${nextOccurrenceTask.dueDate}.`,
          variant: 'success',
        })
      } else {
        toast({
          title: 'Task marked complete',
          description: `Great work on completing "${task.title}".`,
          variant: 'success',
        })
      }
    }

    if (isConfigured) {
      startTransition(async () => {
        await completeTaskAction(task)
      })
    }
  }

  async function handleToggleFocus(task: Task) {
    const nextFocus = !task.isDailyFocus
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, isDailyFocus: nextFocus } : t))
    )

    toast({
      title: nextFocus ? 'Added to Daily Focus' : 'Removed from Daily Focus',
      description: `"${task.title}" is ${nextFocus ? 'now pinned on your desk' : 'unpinned'}.`,
    })

    if (isConfigured) {
      startTransition(async () => {
        await updateTaskAction(task.id, { isDailyFocus: nextFocus })
      })
    }
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!quickTitle.trim()) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      userId: 'default-user',
      title: quickTitle.trim(),
      priority: 'medium',
      status: 'todo',
      dueDate: todayStr,
      recurrence: 'none',
      isDailyFocus: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])
    setQuickTitle('')

    toast({
      title: 'Task created for today',
      description: `"${newTask.title}" added to your actions.`,
      variant: 'success',
    })

    if (isConfigured) {
      startTransition(async () => {
        await createTaskAction({
          title: newTask.title,
          priority: 'medium',
          status: 'todo',
          dueDate: todayStr,
          isDailyFocus: true,
        })
      })
    }
  }

  async function handleCreateTask(input: TaskCreateInput) {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      userId: 'default-user',
      title: input.title,
      description: input.description,
      priority: input.priority || 'medium',
      status: input.status || 'todo',
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      project: input.project,
      tags: input.tags || [],
      recurrence: input.recurrence || 'none',
      goalId: input.goalId,
      linkedNoteId: input.linkedNoteId,
      isDailyFocus: Boolean(input.isDailyFocus),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])

    toast({
      title: 'Task created',
      description: `"${input.title}" added to task list.`,
      variant: 'success',
    })

    if (isConfigured) {
      startTransition(async () => {
        await createTaskAction(input)
      })
    }
  }

  async function handleUpdateTask(id: string, input: TaskUpdateInput) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            ...input,
            updatedAt: new Date().toISOString(),
          }
        }
        return t
      })
    )

    toast({
      title: 'Task updated',
      description: 'Your changes have been saved.',
      variant: 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await updateTaskAction(id, input)
      })
    }
  }

  async function handleDeleteTask(taskId: string) {
    const target = tasks.find((t) => t.id === taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    toast({
      title: 'Task deleted',
      description: target ? `"${target.title}" was removed.` : 'Task removed.',
      variant: 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await deleteTaskAction(taskId)
      })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Offline Banner if Supabase is not connected */}
      {!isConfigured && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#F4EBD5]/60 border border-[#E7DCBE] text-xs text-[#7A6332]">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>
              Preview Mode: Tasks are preserved locally in browser memory. Connect Supabase in{' '}
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
        title="Tasks & Action Matrix"
        description="Organize your actions into clear priorities, due dates, and goal milestones."
        badge={
          <PastelBadge variant="powder">
            {counts.all} active · {counts.today} today
          </PastelBadge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Layers className="w-3.5 h-3.5" />}
              onClick={() => setGroupByPriority(!groupByPriority)}
            >
              {groupByPriority ? 'Flat View' : 'Group by Priority'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingTask(null)
                setIsCreateModalOpen(true)
              }}
            >
              New Task
            </Button>
          </div>
        }
      />

      {/* Quick Add Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-[#E8E6DF] shadow-xs"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#DFEAF2] text-[#1E3345] shrink-0 ml-1">
          <Plus className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Capture a quick task for today and press Enter..."
          className="flex-1 text-sm bg-transparent border-none outline-none text-[#33312F] placeholder:text-[#85817D] px-2 py-1"
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={!quickTitle.trim()}
        >
          Add for Today
        </Button>
      </form>

      {/* Controls Bar: Filters & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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
            All ({counts.all})
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
              {counts.today}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1',
              filter === 'upcoming'
                ? 'bg-[#E8E1F4] text-[#4B3968] border-[#D8CEEA] font-semibold shadow-xs'
                : 'bg-white text-[#85817D] border-[#E8E6DF] hover:border-[#D1CEBF] hover:text-[#33312F]'
            )}
          >
            <span>Upcoming</span>
            <span className="text-[11px] px-1 rounded-full bg-white/70">
              {counts.upcoming}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('overdue')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1',
              filter === 'overdue'
                ? 'bg-rose-100 text-rose-800 border-rose-300 font-semibold shadow-xs'
                : 'bg-white text-[#85817D] border-[#E8E6DF] hover:border-[#D1CEBF] hover:text-[#33312F]'
            )}
          >
            <span>Overdue</span>
            <span className="text-[11px] px-1 rounded-full bg-white/70">
              {counts.overdue}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1',
              filter === 'completed'
                ? 'bg-[#E3EBDD] text-[#283824] border-[#D0DEC8] font-semibold shadow-xs'
                : 'bg-white text-[#85817D] border-[#E8E6DF] hover:border-[#D1CEBF] hover:text-[#33312F]'
            )}
          >
            <span>Completed</span>
            <span className="text-[11px] px-1 rounded-full bg-white/70">
              {counts.completed}
            </span>
          </button>
        </div>

        {/* Sort & Project Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {projects.length > 0 && (
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-1 focus:ring-[#85817D]"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  #{p}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1 bg-white border border-[#E8E6DF] rounded-xl px-2 py-1 text-xs text-[#85817D]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TaskSort)}
              className="bg-transparent border-none outline-none text-[#33312F] cursor-pointer text-xs"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Alphabetical</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List / Matrix */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-[20px] bg-white border border-[#E8E6DF] p-8 sm:p-12 shadow-xs">
          <EmptyState
            color="powder"
            icon={<CheckSquare className="w-6 h-6 text-[#1E3345]" />}
            title={
              filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'overdue'
                ? 'Clear horizon — no overdue tasks'
                : filter === 'today'
                ? 'All clear for today'
                : 'No tasks found'
            }
            description={
              filter === 'today'
                ? 'You have completed all scheduled tasks for today. Add a new action or enjoy your focus.'
                : 'Organize your day with intentional tasks, priorities, and recurring routines.'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditingTask(null)
                  setIsCreateModalOpen(true)
                }}
              >
                Create Task
              </Button>
            }
          />
        </div>
      ) : groupByPriority ? (
        /* Grouped by Priority View */
        <div className="space-y-6">
          {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((pLevel) => {
            const groupTasks = filteredTasks.filter((t) => t.priority === pLevel)
            if (groupTasks.length === 0) return null

            const meta = {
              urgent: { title: 'Urgent Priority', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
              high: { title: 'High Priority', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
              medium: { title: 'Medium Priority', badge: 'bg-sky-50 text-sky-800 border-sky-200' },
              low: { title: 'Low Priority', badge: 'bg-[#FAF9F6] text-[#85817D] border-[#E8E6DF]' },
            }[pLevel]

            return (
              <div key={pLevel} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-md border',
                      meta.badge
                    )}
                  >
                    {meta.title}
                  </span>
                  <span className="text-xs text-[#85817D]">({groupTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {groupTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onToggleFocus={handleToggleFocus}
                      onEdit={(t) => {
                        setEditingTask(t)
                        setIsCreateModalOpen(true)
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Flat List View */
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onToggleFocus={handleToggleFocus}
              onEdit={(t) => {
                setEditingTask(t)
                setIsCreateModalOpen(true)
              }}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingTask(null)
        }}
        goals={goals}
        notes={notes}
        onCreateTask={handleCreateTask}
        initialTask={editingTask}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  )
}
