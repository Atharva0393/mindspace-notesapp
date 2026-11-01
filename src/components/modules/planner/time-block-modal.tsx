'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Calendar, CheckCircle2, CheckSquare } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TimeBlock, TimeBlockCreateInput, TimeBlockUpdateInput } from '@/types/planner'
import { Task } from '@/types/tasks'
import { PastelColorKey } from '@/lib/constants/colors'
import { cn } from '@/lib/utils'

export interface TimeBlockModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  tasks: Task[]
  onCreateTimeBlock: (input: TimeBlockCreateInput) => void
  initialBlock?: TimeBlock | null
  onUpdateTimeBlock?: (id: string, input: TimeBlockUpdateInput) => void
  preselectedTaskId?: string | null
  preselectedStartTime?: string | null
}

const COLOR_THEMES: { id: PastelColorKey; name: string; bg: string; border: string }[] = [
  { id: 'powder', name: 'Powder Blue', bg: 'bg-[#DFEAF2]', border: 'border-[#CBDDE9]' },
  { id: 'sage', name: 'Sage', bg: 'bg-[#E3EBDD]', border: 'border-[#CCD9C3]' },
  { id: 'buttercream', name: 'Buttercream', bg: 'bg-[#F4EBD5]', border: 'border-[#E5D7B7]' },
  { id: 'peach', name: 'Peach Blush', bg: 'bg-[#F4E4DC]', border: 'border-[#E7D0C4]' },
  { id: 'lavender', name: 'Lavender', bg: 'bg-[#E8E1F4]', border: 'border-[#D5CBE5]' },
  { id: 'pink', name: 'Dusty Pink', bg: 'bg-[#F0DFE8]', border: 'border-[#DFC6D4]' },
]

export function TimeBlockModal({
  isOpen,
  onClose,
  selectedDate,
  tasks,
  onCreateTimeBlock,
  initialBlock,
  onUpdateTimeBlock,
  preselectedTaskId,
  preselectedStartTime,
}: TimeBlockModalProps) {
  const [title, setTitle] = useState('')
  const [blockDate, setBlockDate] = useState(selectedDate)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [colorTheme, setColorTheme] = useState<PastelColorKey>('powder')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const isEditing = Boolean(initialBlock)

  useEffect(() => {
    if (initialBlock) {
      setTitle(initialBlock.title || '')
      setBlockDate(initialBlock.blockDate || selectedDate)
      setStartTime(initialBlock.startTime || '09:00')
      setEndTime(initialBlock.endTime || '10:00')
      setColorTheme(initialBlock.colorTheme || 'powder')
      setTaskId(initialBlock.taskId || null)
      setNotes(initialBlock.notes || '')
    } else {
      setBlockDate(selectedDate)
      setStartTime(preselectedStartTime || '09:00')

      // Compute end time = start time + 1 hour
      if (preselectedStartTime) {
        const [h, m] = preselectedStartTime.split(':').map(Number)
        const endH = Math.min(23, (h || 9) + 1)
        setEndTime(`${endH.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}`)
      } else {
        setEndTime('10:00')
      }

      if (preselectedTaskId) {
        const matched = tasks.find((t) => t.id === preselectedTaskId)
        setTaskId(preselectedTaskId)
        setTitle(matched ? matched.title : '')
      } else {
        setTitle('')
        setTaskId(null)
      }

      setColorTheme('powder')
      setNotes('')
    }
  }, [initialBlock, isOpen, selectedDate, preselectedTaskId, preselectedStartTime, tasks])

  function handleTaskSelect(selectedId: string) {
    setTaskId(selectedId || null)
    if (selectedId && !title) {
      const matched = tasks.find((t) => t.id === selectedId)
      if (matched) setTitle(matched.title)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    if (isEditing && initialBlock && onUpdateTimeBlock) {
      onUpdateTimeBlock(initialBlock.id, {
        title: title.trim(),
        blockDate,
        startTime,
        endTime,
        colorTheme,
        taskId: taskId || null,
        notes: notes.trim() || null,
      })
    } else {
      onCreateTimeBlock({
        title: title.trim(),
        blockDate,
        startTime,
        endTime,
        colorTheme,
        taskId: taskId || null,
        notes: notes.trim() || null,
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
            <Clock className="w-4 h-4" />
          </div>
          <span>{isEditing ? 'Edit Time Block' : 'Schedule Time Block'}</span>
        </div>
      }
      description="Reserve focused time on your timeline to protect your flow state."
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
            {isEditing ? 'Save Block' : 'Schedule Block'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Focus Block Title <span className="text-rose-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deep Work: Habit Studio & Calendar UI"
            autoFocus
          />
        </div>

        {/* Link to existing Task */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-[#85817D]" />
            Connect Task <span className="text-[#85817D] font-normal">(optional)</span>
          </label>
          <select
            value={taskId || ''}
            onChange={(e) => handleTaskSelect(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
          >
            <option value="">No linked task</option>
            {tasks
              .filter((t) => t.status !== 'completed' || t.id === taskId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.priority})
                </option>
              ))}
          </select>
        </div>

        {/* Date and Time Span */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#85817D]" />
              Date
            </label>
            <input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#85817D]" />
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#85817D]" />
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-xl bg-white border border-[#E8E6DF] text-[#33312F] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#33312F]"
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

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Focus Notes <span className="text-[#85817D] font-normal">(optional)</span>
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Subtasks, links, or specific focus objectives..."
            rows={2}
          />
        </div>
      </form>
    </Modal>
  )
}
