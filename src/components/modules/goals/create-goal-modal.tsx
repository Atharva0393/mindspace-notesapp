'use client'

import React, { useState, useEffect } from 'react'
import { Target, Calendar, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Goal, GoalCategory, GoalCreateInput, GoalUpdateInput, GoalMilestone } from '@/types/tasks'
import { Note } from '@/types/notes'
import { PastelColorKey } from '@/lib/constants/colors'
import { cn } from '@/lib/utils'

export interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  notes: Note[]
  onCreateGoal: (input: GoalCreateInput) => void
  initialGoal?: Goal | null
  onUpdateGoal?: (id: string, input: GoalUpdateInput) => void
}

const CATEGORIES: GoalCategory[] = [
  'Personal',
  'Career',
  'Education',
  'Fitness',
  'Finance',
  'Health',
  'Other',
]

const COLOR_THEMES: { id: PastelColorKey; name: string; bg: string; border: string }[] = [
  { id: 'powder', name: 'Powder Blue', bg: 'bg-[#DFEAF2]', border: 'border-[#CBDDE9]' },
  { id: 'sage', name: 'Sage', bg: 'bg-[#E3EBDD]', border: 'border-[#CCD9C3]' },
  { id: 'buttercream', name: 'Buttercream', bg: 'bg-[#F4EBD5]', border: 'border-[#E5D7B7]' },
  { id: 'peach', name: 'Peach Blush', bg: 'bg-[#F4E4DC]', border: 'border-[#E7D0C4]' },
  { id: 'lavender', name: 'Lavender', bg: 'bg-[#E8E1F4]', border: 'border-[#D5CBE5]' },
  { id: 'pink', name: 'Dusty Pink', bg: 'bg-[#F0DFE8]', border: 'border-[#DFC6D4]' },
]

export function CreateGoalModal({
  isOpen,
  onClose,
  notes: _notes,
  onCreateGoal,
  initialGoal,
  onUpdateGoal,
}: CreateGoalModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<GoalCategory>('Personal')
  const [colorTheme, setColorTheme] = useState<PastelColorKey>('powder')
  const [targetDate, setTargetDate] = useState('')
  const [milestones, setMilestones] = useState<{ id?: string; title: string; dueDate?: string }[]>([
    { title: '' },
  ])
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])

  const isEditing = Boolean(initialGoal)

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title || '')
      setDescription(initialGoal.description || '')
      setCategory(initialGoal.category || 'Personal')
      setColorTheme(initialGoal.colorTheme || 'powder')
      setTargetDate(initialGoal.targetDate || '')
      setMilestones(
        initialGoal.milestones?.length
          ? initialGoal.milestones.map((m) => ({ id: m.id, title: m.title, dueDate: m.dueDate || '' }))
          : [{ title: '' }]
      )
      setSelectedNoteIds(initialGoal.linkedNoteIds || [])
    } else {
      setTitle('')
      setDescription('')
      setCategory('Personal')
      setColorTheme('powder')
      setTargetDate('')
      setMilestones([{ title: '' }])
      setSelectedNoteIds([])
    }
  }, [initialGoal, isOpen])

  function handleAddMilestone() {
    setMilestones((prev) => [...prev, { title: '' }])
  }

  function handleMilestoneChange(index: number, val: string) {
    setMilestones((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], title: val }
      return copy
    })
  }

  function handleRemoveMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, idx) => idx !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const validMilestones = milestones
      .filter((m) => m.title.trim().length > 0)
      .map((m, idx) => ({
        id: m.id || `m-${Date.now()}-${idx}`,
        title: m.title.trim(),
        dueDate: m.dueDate || null,
        isCompleted: false,
      }))

    if (isEditing && initialGoal && onUpdateGoal) {
      // Preserve existing completion states for milestones if matching
      const mergedMilestones: GoalMilestone[] = validMilestones.map((vm) => {
        const existing = initialGoal.milestones?.find((m) => m.id === vm.id)
        return {
          id: vm.id,
          title: vm.title,
          dueDate: vm.dueDate,
          isCompleted: existing ? existing.isCompleted : false,
        }
      })

      const completedCount = mergedMilestones.filter((m) => m.isCompleted).length
      const progress =
        mergedMilestones.length > 0
          ? Math.round((completedCount / mergedMilestones.length) * 100)
          : initialGoal.progress

      onUpdateGoal(initialGoal.id, {
        title: title.trim(),
        description: description.trim() || null,
        category,
        colorTheme,
        targetDate: targetDate || null,
        milestones: mergedMilestones,
        progress,
        linkedNoteIds: selectedNoteIds,
      })
    } else {
      onCreateGoal({
        title: title.trim(),
        description: description.trim() || null,
        category,
        colorTheme,
        targetDate: targetDate || null,
        milestones: validMilestones.map((m) => ({ title: m.title, dueDate: m.dueDate })),
        linkedNoteIds: selectedNoteIds,
      })
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#DFEAF2] border border-[#CBDDE9] flex items-center justify-center text-[#1E3345]">
            <Target className="w-4 h-4" />
          </div>
          <span>{isEditing ? 'Edit Goal' : 'Create New Goal'}</span>
        </div>
      }
      description={
        isEditing
          ? 'Refine your milestones, deadlines, and theme.'
          : 'Define an overarching milestone, target date, and key steps.'
      }
      footer={
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            {isEditing ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Goal Title <span className="text-rose-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Launch Notepad.ai v1.0"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Description <span className="text-[#85817D] font-normal">(optional)</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why does this matter? What is the desired end state?"
            rows={2}
          />
        </div>

        {/* Category & Target Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#85817D]" />
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
            />
          </div>
        </div>

        {/* Color Theme */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1.5">
            Card Pastel Theme
          </label>
          <div className="grid grid-cols-6 gap-2">
            {COLOR_THEMES.map((theme) => {
              const isSelected = colorTheme === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setColorTheme(theme.id)}
                  className={cn(
                    'h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer',
                    theme.bg,
                    theme.border,
                    isSelected
                      ? 'ring-2 ring-[#33312F] scale-105 shadow-xs'
                      : 'hover:scale-102 opacity-80 hover:opacity-100'
                  )}
                  title={theme.name}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#33312F]" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Milestones Builder */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#33312F]">
              Milestones / Key Steps
            </label>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="text-xs font-medium text-[#4D6D82] hover:text-[#1E3345] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Milestone
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#85817D] w-4 text-right">
                  {idx + 1}.
                </span>
                <Input
                  value={m.title}
                  onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                  placeholder="e.g. Design token documentation"
                  className="flex-1 text-xs py-1.5"
                />
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-1.5 text-[#85817D] hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
