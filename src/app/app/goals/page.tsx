'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import { Target, Plus, Database, Award, CheckCircle2, TrendingUp } from 'lucide-react'
import { Goal, GoalCategory, GoalCreateInput, GoalUpdateInput } from '@/types/tasks'
import { Note } from '@/types/notes'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { useToast } from '@/components/ui/toast'
import { GoalCard } from '@/components/modules/goals/goal-card'
import { CreateGoalModal } from '@/components/modules/goals/create-goal-modal'
import { getLocalGoals, saveLocalGoals, getLocalTasks } from '@/lib/workspace/store'
import { getLocalNotes } from '@/lib/notes/storage'
import {
  getGoalsData,
  createGoalAction,
  updateGoalAction,
  deleteGoalAction,
} from './actions'
import { cn } from '@/lib/utils'

const CATEGORIES: (GoalCategory | 'All')[] = [
  'All',
  'Career',
  'Personal',
  'Health',
  'Education',
  'Fitness',
  'Finance',
]

export default function GoalsPage() {
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  // State
  const [goals, setGoals] = useState<Goal[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'All'>('All')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Initial Load
  useEffect(() => {
    async function load() {
      try {
        const res = await getGoalsData()
        setIsConfigured(res.isConfigured)

        if (res.isAuthenticated) {
          setGoals(res.goals)
        } else {
          setGoals(getLocalGoals())
        }
      } catch {
        setGoals(getLocalGoals())
      } finally {
        setNotes(getLocalNotes())
        setIsLoaded(true)
      }
    }
    load()
  }, [])

  // Sync to local storage if offline/preview
  useEffect(() => {
    if (isLoaded && !isConfigured) {
      saveLocalGoals(goals)
    }
  }, [goals, isLoaded, isConfigured])

  // Attach task counts to goals
  const enrichedGoals = useMemo(() => {
    const tasks = getLocalTasks()
    return goals.map((g) => {
      const linkedTasks = tasks.filter((t) => t.goalId === g.id)
      const completedTasks = linkedTasks.filter((t) => t.status === 'completed')
      return {
        ...g,
        tasksCount: linkedTasks.length,
        completedTasksCount: completedTasks.length,
      }
    })
  }, [goals])

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (selectedCategory === 'All') return enrichedGoals
    return enrichedGoals.filter((g) => g.category === selectedCategory)
  }, [enrichedGoals, selectedCategory])

  // Stats calculation
  const stats = useMemo(() => {
    const active = enrichedGoals.filter((g) => !g.isCompleted)
    const achieved = enrichedGoals.filter((g) => g.isCompleted)
    const avgProgress =
      enrichedGoals.length > 0
        ? Math.round(
            enrichedGoals.reduce((sum, g) => sum + (g.progress || 0), 0) /
              enrichedGoals.length
          )
        : 0

    let totalMilestones = 0
    let completedMilestones = 0
    enrichedGoals.forEach((g) => {
      totalMilestones += g.milestones?.length || 0
      completedMilestones += g.milestones?.filter((m) => m.isCompleted).length || 0
    })

    return {
      activeCount: active.length,
      achievedCount: achieved.length,
      avgProgress,
      totalMilestones,
      completedMilestones,
    }
  }, [enrichedGoals])

  // Handlers
  async function handleCreateGoal(input: GoalCreateInput) {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      userId: 'default-user',
      title: input.title,
      description: input.description,
      category: input.category || 'Personal',
      colorTheme: input.colorTheme || 'powder',
      targetDate: input.targetDate,
      progress: 0,
      milestones: (input.milestones || []).map((m, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        title: m.title,
        dueDate: m.dueDate,
        isCompleted: false,
      })),
      linkedNoteIds: input.linkedNoteIds || [],
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setGoals((prev) => [newGoal, ...prev])

    toast({
      title: 'Goal established',
      description: `"${input.title}" added to your ambitions.`,
      variant: 'success',
    })

    if (isConfigured) {
      startTransition(async () => {
        await createGoalAction(input)
      })
    }
  }

  async function handleUpdateGoal(id: string, input: GoalUpdateInput) {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            ...input,
            updatedAt: new Date().toISOString(),
          }
        }
        return g
      })
    )

    toast({
      title: 'Goal updated',
      description: 'Your goal details have been saved.',
      variant: 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await updateGoalAction(id, input)
      })
    }
  }

  async function handleToggleMilestone(
    goalId: string,
    milestoneId: string,
    nextCompleted: boolean
  ) {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updatedMilestones = (g.milestones || []).map((m) =>
            m.id === milestoneId ? { ...m, isCompleted: nextCompleted } : m
          )
          const completedCount = updatedMilestones.filter((m) => m.isCompleted).length
          const nextProgress =
            updatedMilestones.length > 0
              ? Math.round((completedCount / updatedMilestones.length) * 100)
              : g.progress

          const updatedGoal = {
            ...g,
            milestones: updatedMilestones,
            progress: nextProgress,
            isCompleted: nextProgress === 100 ? true : g.isCompleted,
            updatedAt: new Date().toISOString(),
          }

          if (isConfigured) {
            startTransition(async () => {
              await updateGoalAction(goalId, {
                milestones: updatedMilestones,
                progress: nextProgress,
                isCompleted: updatedGoal.isCompleted,
              })
            })
          }

          return updatedGoal
        }
        return g
      })
    )

    toast({
      title: nextCompleted ? 'Milestone reached' : 'Milestone reopened',
      description: nextCompleted
        ? 'Progress updated across this goal.'
        : 'Milestone marked incomplete.',
      variant: nextCompleted ? 'success' : 'default',
    })
  }

  async function handleToggleComplete(goal: Goal) {
    const nextCompleted = !goal.isCompleted
    const nextProgress = nextCompleted ? 100 : goal.progress

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goal.id
          ? {
              ...g,
              isCompleted: nextCompleted,
              progress: nextProgress,
              updatedAt: new Date().toISOString(),
            }
          : g
      )
    )

    toast({
      title: nextCompleted ? 'Goal Achieved! 🎉' : 'Goal reopened',
      description: nextCompleted
        ? `Congratulations on achieving "${goal.title}".`
        : `"${goal.title}" marked as in progress.`,
      variant: 'success',
    })

    if (isConfigured) {
      startTransition(async () => {
        await updateGoalAction(goal.id, {
          isCompleted: nextCompleted,
          progress: nextProgress,
        })
      })
    }
  }

  async function handleDeleteGoal(goalId: string) {
    const target = goals.find((g) => g.id === goalId)
    setGoals((prev) => prev.filter((g) => g.id !== goalId))

    toast({
      title: 'Goal deleted',
      description: target ? `"${target.title}" was removed.` : 'Goal removed.',
      variant: 'default',
    })

    if (isConfigured) {
      startTransition(async () => {
        await deleteGoalAction(goalId)
      })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Offline Banner */}
      {!isConfigured && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#F4EBD5]/60 border border-[#E7DCBE] text-xs text-[#7A6332]">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>
              Preview Mode: Goals are preserved locally in browser memory. Connect Supabase in{' '}
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
        title="Goals & Milestones"
        description="High-level ambitions connected directly to your day-to-day tasks and notes."
        badge={
          <PastelBadge variant="powder">
            {stats.activeCount} active · {stats.avgProgress}% avg velocity
          </PastelBadge>
        }
        action={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setEditingGoal(null)
              setIsCreateModalOpen(true)
            }}
          >
            New Goal
          </Button>
        }
      />

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 shadow-2xs">
          <div className="text-xs text-[#85817D] flex items-center gap-1.5 font-medium">
            <Target className="w-3.5 h-3.5 text-[#1E3345]" />
            Active Goals
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#33312F]">
            {stats.activeCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 shadow-2xs">
          <div className="text-xs text-[#85817D] flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-[#283824]" />
            Average Progress
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#33312F]">
            {stats.avgProgress}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 shadow-2xs">
          <div className="text-xs text-[#85817D] flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#7A6332]" />
            Milestones Hit
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#33312F]">
            {stats.completedMilestones}/{stats.totalMilestones}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 shadow-2xs">
          <div className="text-xs text-[#85817D] flex items-center gap-1.5 font-medium">
            <Award className="w-3.5 h-3.5 text-[#7A281E]" />
            Goals Achieved
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#33312F]">
            {stats.achievedCount}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border',
              selectedCategory === cat
                ? 'bg-[#33312F] text-white border-[#33312F] shadow-xs'
                : 'bg-white text-[#85817D] border-[#E8E6DF] hover:border-[#D1CEBF] hover:text-[#33312F]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="rounded-[20px] bg-white border border-[#E8E6DF] p-8 sm:p-12 shadow-xs">
          <EmptyState
            color="pink"
            icon={<Target className="w-6 h-6 text-[#442637]" />}
            title="No goals found"
            description="Establish quarterly ambitions, break them down into progressive milestones, and link daily tasks."
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditingGoal(null)
                  setIsCreateModalOpen(true)
                }}
              >
                Create Goal
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggleComplete={handleToggleComplete}
              onToggleMilestone={handleToggleMilestone}
              onEdit={(g) => {
                setEditingGoal(g)
                setIsCreateModalOpen(true)
              }}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingGoal(null)
        }}
        notes={notes}
        onCreateGoal={handleCreateGoal}
        initialGoal={editingGoal}
        onUpdateGoal={handleUpdateGoal}
      />
    </div>
  )
}
