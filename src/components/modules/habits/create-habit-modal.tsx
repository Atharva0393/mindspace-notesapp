'use client'

import React, { useState } from 'react'
import { Flame, Clock } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { HabitCategory, HabitFrequency, HabitCreateInput } from '@/types/habits'
import { PASTEL_PALETTE, PastelColorKey, PASTEL_COLOR_KEYS } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/styling'

export interface CreateHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateHabit: (input: HabitCreateInput) => void
}

const CATEGORIES: HabitCategory[] = [
  'Health',
  'Fitness',
  'Learning',
  'Productivity',
  'Personal',
  'Mindfulness',
  'Other',
]

const DAYS_OF_WEEK = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 7, label: 'Sun' },
]

export function CreateHabitModal({
  isOpen,
  onClose,
  onCreateHabit,
}: CreateHabitModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<HabitCategory>('Health')
  const [colorTheme, setColorTheme] = useState<PastelColorKey>('peach')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7])
  const [reminderTime, setReminderTime] = useState('')

  function handleFrequencyChange(newFreq: HabitFrequency) {
    setFrequency(newFreq)
    if (newFreq === 'daily') {
      setScheduleDays([1, 2, 3, 4, 5, 6, 7])
    } else if (newFreq === 'weekdays') {
      setScheduleDays([1, 2, 3, 4, 5])
    } else if (newFreq === 'weekends') {
      setScheduleDays([6, 7])
    }
  }

  function toggleDay(dayNumber: number) {
    if (scheduleDays.includes(dayNumber)) {
      if (scheduleDays.length > 1) {
        setScheduleDays(scheduleDays.filter((d) => d !== dayNumber))
        setFrequency('custom')
      }
    } else {
      setScheduleDays([...scheduleDays, dayNumber].sort())
      setFrequency('custom')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    onCreateHabit({
      title: title.trim(),
      description: description.trim() || null,
      category,
      frequency,
      scheduleDays,
      targetCount: 1,
      colorTheme,
      reminderTime: reminderTime || null,
      startDate: new Date().toISOString().split('T')[0],
    })

    // Reset Form
    setTitle('')
    setDescription('')
    setCategory('Health')
    setColorTheme('peach')
    setFrequency('daily')
    setScheduleDays([1, 2, 3, 4, 5, 6, 7])
    setReminderTime('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F4E4DC] border border-[#E8D4CA] flex items-center justify-center text-[#442A20]">
            <Flame className="w-4 h-4" />
          </div>
          <span>Create New Habit</span>
        </div>
      }
      description="Design a sustainable daily or weekly cadence with physical check-offs."
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
            Create Habit
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Name */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Habit Name
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read 20 pages, Morning Run, Daily Meditation"
            autoFocus
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Intention / Notes
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why does this habit matter to you?"
            className="min-h-[70px]"
          />
        </div>

        {/* Category & Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
              className="w-full h-9 px-3 bg-white border border-[#EAE6DF] rounded-[11px] text-xs text-[#33312F] focus:outline-hidden focus:ring-2 focus:ring-[#C8BEDE]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33312F] mb-1">
              Pastel Card Theme
            </label>
            <div className="flex items-center gap-1.5 pt-1">
              {PASTEL_COLOR_KEYS.slice(0, 6).map((key) => {
                const p = PASTEL_PALETTE[key]
                const isSelected = colorTheme === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColorTheme(key)}
                    className={cn(
                      'w-6 h-6 rounded-full border transition-transform cursor-pointer',
                      p.bgClass,
                      isSelected
                        ? 'scale-110 border-[#33312F] ring-2 ring-[#33312F]/20'
                        : 'border-black/10 hover:scale-105'
                    )}
                    title={p.name}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Frequency & Schedule */}
        <div className="pt-2 border-t border-[#EAE6DF] space-y-2.5">
          <label className="block text-xs font-semibold text-[#33312F]">
            Cadence &amp; Days
          </label>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'daily', label: 'Every Day' },
              { id: 'weekdays', label: 'Mon – Fri' },
              { id: 'weekends', label: 'Weekends' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFrequencyChange(f.id as HabitFrequency)}
                className={cn(
                  'px-2.5 py-1 rounded-[8px] text-xs font-medium border transition-colors cursor-pointer',
                  frequency === f.id
                    ? 'bg-[#33312F] text-white border-[#33312F]'
                    : 'bg-white border-[#EAE6DF] text-[#5C5956] hover:bg-[#FAF9F6]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Day selection pills */}
          <div className="flex items-center gap-1 pt-1">
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = scheduleDays.includes(d.id)
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDay(d.id)}
                  className={cn(
                    'flex-1 py-1 text-center rounded-[7px] text-[11px] font-semibold transition-all border cursor-pointer',
                    isSelected
                      ? 'bg-[#E3EBDD] border-[#D0DEC8] text-[#283824] shadow-xs'
                      : 'bg-white border-[#EAE6DF] text-[#AFAAA4] hover:text-[#33312F]'
                  )}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Reminder Time */}
        <div className="pt-2 border-t border-[#EAE6DF]">
          <label className="block text-xs font-semibold text-[#33312F] mb-1">
            Optional Daily Reminder Time
          </label>
          <div className="relative">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-white border border-[#EAE6DF] rounded-[11px] text-xs text-[#33312F] focus:outline-hidden focus:ring-2 focus:ring-[#C8BEDE]"
            />
            <Clock className="w-3.5 h-3.5 text-[#85817D] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </form>
    </Modal>
  )
}
