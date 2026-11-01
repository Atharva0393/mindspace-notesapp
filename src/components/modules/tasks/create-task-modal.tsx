'use client'

import React, { useState, useEffect } from 'react'
import { CheckSquare, Calendar, Clock, Flag, Repeat, Target, BookOpen } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Task, TaskPriority, TaskRecurrence, TaskCreateInput, TaskUpdateInput, Goal } from '@/types/tasks'
import { Note } from '@/types/notes'
import { cn } from '@/lib/utils/styling'

export interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  goals: Goal[]
  notes: Note[]
  onCreateTask: (input: TaskCreateInput) => void
  initialTask?: Task | null
  onUpdateTask?: (id: string, input: TaskUpdateInput) => void
}

const PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
  { id: 'urgent', label: 'Urgent', color: 'bg-[#F7DFD8] text-[#7A281E] border-[#E8C2B8]' },
  { id: 'high', label: 'High', color: 'bg-[#F4E4DC] text-[#442A20] border-[#E8D4CA]' },
  { id: 'medium', label: 'Medium', color: 'bg-[#F4EBD5] text-[#42361D] border-[#E7DCBE]' },
  { id: 'low', label: 'Low', color: 'bg-[#E3EBDD] text-[#283824] border-[#D0DEC8]' },
]

export function CreateTaskModal({
  isOpen,
  onClose,
  goals,
  notes,
  onCreateTask,
  initialTask,
  onUpdateTask,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('2026-11-01')
  const [dueTime, setDueTime] = useState('')
  const [project, setProject] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none')
  const [goalId, setGoalId] = useState<string | null>(null)
  const [linkedNoteId, setLinkedNoteId] = useState<string | null>(null)
  const [isDailyFocus, setIsDailyFocus] = useState(false)

  const isEditing = Boolean(initialTask)

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '')
      setDescription(initialTask.description || '')
      setPriority(initialTask.priority || 'medium')
      setDueDate(initialTask.dueDate || new Date().toISOString().split('T')[0])
      setDueTime(initialTask.dueTime || '')
      setProject(initialTask.project || '')
      setTagsInput((initialTask.tags || []).join(', '))
      setRecurrence(initialTask.recurrence || 'none')
      setGoalId(initialTask.goalId || null)
      setLinkedNoteId(initialTask.linkedNoteId || null)
      setIsDailyFocus(Boolean(initialTask.isDailyFocus))
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate(new Date().toISOString().split('T')[0])
      setDueTime('')
      setProject('')
      setTagsInput('')
      setRecurrence('none')
      setGoalId(null)
      setLinkedNoteId(null)
      setIsDailyFocus(false)
    }
  }, [initialTask, isOpen])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))
      .filter(Boolean)

    if (isEditing && initialTask && onUpdateTask) {
      onUpdateTask(initialTask.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        project: project.trim() || null,
        tags: parsedTags,
        recurrence,
        goalId: goalId || null,
        linkedNoteId: linkedNoteId || null,
        isDailyFocus,
      })
    } else {
      onCreateTask({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status: 'todo',
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        project: project.trim() || null,
        tags: parsedTags,
        recurrence,
        goalId: goalId || null,
        linkedNoteId: linkedNoteId || null,
        isDailyFocus,
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
            <CheckSquare className="w-4 h-4" />
          </div>
          <span>{isEditing ? 'Edit Task' : 'Create New Task'}</span>
        </div>
      }
      description={
        isEditing
          ? 'Update your task details, priorities, and schedules.'
          : 'Add an action item with priorities, due dates, and recurrence rules.'
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
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Draft design system specifications"
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
            placeholder="Key notes, context, or checklist details..."
            rows={2}
          />
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1.5 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-[#85817D]" />
            Priority Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    'py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer',
                    p.color,
                    isSelected
                      ? 'ring-2 ring-[#33312F]/20 scale-[1.02] shadow-xs font-semibold'
                      : 'opacity-70 hover:opacity-100'
                  )}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dates & Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#85817D]" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#85817D]" />
              Due Time <span className="text-[#85817D] font-normal">(optional)</span>
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
            />
          </div>
        </div>

        {/* Project & Tags */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1">
              Project <span className="text-[#85817D] font-normal">(optional)</span>
            </label>
            <Input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. Productivity Suite"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1">
              Tags <span className="text-[#85817D] font-normal">(comma separated)</span>
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="design, v1, sprint"
            />
          </div>
        </div>

        {/* Recurrence */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
            <Repeat className="w-3.5 h-3.5 text-[#85817D]" />
            Recurrence
          </label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Repeats Daily</option>
            <option value="weekdays">Weekdays (Mon-Fri)</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Link to Goal & Note */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-[#85817D]" />
              Link to Goal
            </label>
            <select
              value={goalId || ''}
              onChange={(e) => setGoalId(e.target.value || null)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
            >
              <option value="">None</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#85817D]" />
              Link to Note
            </label>
            <select
              value={linkedNoteId || ''}
              onChange={(e) => setLinkedNoteId(e.target.value || null)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
            >
              <option value="">None</option>
              {notes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Daily Focus Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDailyFocus}
              onChange={(e) => setIsDailyFocus(e.target.checked)}
              className="rounded border-[#E8E6DF] text-[#33312F] focus:ring-[#33312F]"
            />
            <span className="text-xs font-medium text-[#33312F]">
              Set as Today&apos;s Focus Task
            </span>
          </label>
        </div>
      </form>
    </Modal>
  )
}
