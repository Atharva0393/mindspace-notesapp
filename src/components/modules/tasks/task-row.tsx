'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Calendar,
  Clock,
  Repeat,
  Target,
  FileText,
  Star,
  MoreVertical,
  Trash2,
  Edit2,
  Flame,
  AlertCircle,
} from 'lucide-react'
import { Task, TaskPriority } from '@/types/tasks'
import { cn } from '@/lib/utils'
import { formatLocalDate } from '@/lib/habits/streaks'

interface TaskRowProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onToggleFocus?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  todayDateStr?: string
}

export function TaskRow({
  task,
  onToggleComplete,
  onToggleFocus,
  onEdit,
  onDelete,
  todayDateStr,
}: TaskRowProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const isCompleted = task.status === 'completed'

  // Date comparison
  const baseDate = currentDate ? new Date(currentDate.getTime()) : new Date(2026, 10, 1)
  const todayStr = todayDateStr || formatLocalDate(baseDate)
  const tomorrow = new Date(baseDate.getTime())
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = formatLocalDate(tomorrow)

  const isToday = task.dueDate === todayStr
  const isTomorrow = task.dueDate === tomorrowStr
  const isOverdue = task.dueDate && task.dueDate < todayStr && !isCompleted

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/70',
          icon: <Flame className="w-3 h-3 text-rose-500" />,
          label: 'Urgent',
        }
      case 'high':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/70',
          icon: <AlertCircle className="w-3 h-3 text-amber-600" />,
          label: 'High',
        }
      case 'medium':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200/70',
          icon: null,
          label: 'Medium',
        }
      case 'low':
      default:
        return {
          bg: 'bg-[#FAF9F6] text-[#85817D] border-[#E8E6DF]',
          icon: null,
          label: 'Low',
        }
    }
  }

  const priorityMeta = getPriorityStyle(task.priority)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'group relative flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border transition-all duration-150',
        isCompleted
          ? 'bg-[#FAF9F6]/60 border-[#E8E6DF]/60 opacity-60'
          : 'bg-white border-[#E8E6DF] hover:border-[#D1CEBF] hover:shadow-xs'
      )}
    >
      {/* Left: Checkbox & Info */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Custom Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer',
            isCompleted
              ? 'bg-[#E3EBDD] border-[#CCD9C3] text-[#33312F]'
              : 'border-[#D1CEBF] bg-[#FAF9F6] hover:border-[#85817D] hover:bg-white'
          )}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
        >
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </motion.div>
          )}
        </button>

        {/* Content details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-sm font-medium tracking-tight transition-all',
                isCompleted
                  ? 'line-through text-[#85817D]'
                  : 'text-[#33312F]'
              )}
            >
              {task.title}
            </span>

            {/* Daily Focus Star Badge */}
            {task.isDailyFocus && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-[#F4EBD5] text-[#7A6332] border border-[#E5D7B7]">
                <Star className="w-2.5 h-2.5 fill-current" />
                Focus
              </span>
            )}

            {/* Priority Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border',
                priorityMeta.bg
              )}
            >
              {priorityMeta.icon}
              {priorityMeta.label}
            </span>

            {/* Recurrence Indicator */}
            {task.recurrence && task.recurrence !== 'none' && (
              <span
                className="inline-flex items-center gap-1 text-[11px] text-[#85817D] bg-[#FAF9F6] border border-[#E8E6DF] px-1.5 py-0.5 rounded-md"
                title={`Repeats: ${task.recurrence}`}
              >
                <Repeat className="w-2.5 h-2.5" />
                <span className="capitalize">{task.recurrence}</span>
              </span>
            )}
          </div>

          {/* Description if present */}
          {task.description && (
            <p className="text-xs text-[#85817D] line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Meta badges: Due date, Project, Linked Goal / Note */}
          <div className="flex items-center gap-3 text-xs text-[#85817D] flex-wrap pt-0.5">
            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px]',
                  isOverdue
                    ? 'text-rose-600 font-semibold'
                    : isToday
                    ? 'text-amber-800 font-medium'
                    : 'text-[#85817D]'
                )}
              >
                <Calendar className="w-3 h-3" />
                {isOverdue && 'Overdue: '}
                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : task.dueDate}
                {task.dueTime && (
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    <Clock className="w-2.5 h-2.5" />
                    {task.dueTime}
                  </span>
                )}
              </span>
            )}

            {/* Project */}
            {task.project && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#E8E6DF] text-[#605D58]">
                #{task.project}
              </span>
            )}

            {/* Linked Goal */}
            {(task.goalTitle || task.goalId) && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#605D58] bg-[#DFEAF2]/50 border border-[#CBDDE9] px-1.5 py-0.5 rounded">
                <Target className="w-2.5 h-2.5 text-[#4D6D82]" />
                <span className="max-w-[120px] truncate">
                  {task.goalTitle || 'Linked Goal'}
                </span>
              </span>
            )}

            {/* Linked Note */}
            {(task.linkedNoteTitle || task.linkedNoteId) && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#605D58] bg-[#E8E1F4]/50 border border-[#D5CBE5] px-1.5 py-0.5 rounded">
                <FileText className="w-2.5 h-2.5 text-[#6E5D87]" />
                <span className="max-w-[120px] truncate">
                  {task.linkedNoteTitle || 'Linked Note'}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick actions and Menu */}
      <div className="flex items-center gap-1 shrink-0">
        {onToggleFocus && (
          <button
            type="button"
            onClick={() => onToggleFocus(task)}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              task.isDailyFocus
                ? 'text-amber-500 hover:bg-amber-50'
                : 'text-[#85817D] hover:bg-[#FAF9F6] opacity-0 group-hover:opacity-100'
            )}
            title={task.isDailyFocus ? 'Remove from daily focus' : 'Add to daily focus'}
          >
            <Star
              className={cn(
                'w-4 h-4',
                task.isDailyFocus && 'fill-current'
              )}
            />
          </button>
        )}

        {/* Dropdown Options */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-[#85817D] hover:bg-[#FAF9F6] hover:text-[#33312F] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#E8E6DF] rounded-xl shadow-md py-1 z-30 text-xs">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(task)
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#FAF9F6] text-[#33312F] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#85817D]" />
                    Edit task
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(task.id)
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete task
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
