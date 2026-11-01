'use client'

import React from 'react'
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  CheckSquare,
  StickyNote,
  Target,
  Flame,
  Calendar,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { AIProposedAction, AIActionType } from '@/types/ai'

interface AIProposedActionCardProps {
  action: AIProposedAction
  onApprove: (action: AIProposedAction) => void
  onReject: (action: AIProposedAction) => void
  isExecuting?: boolean
}

function getActionIcon(type: AIActionType) {
  switch (type) {
    case 'create_task':
    case 'update_task':
      return <CheckSquare className="w-4 h-4 text-[#2E6826]" />
    case 'create_note':
      return <StickyNote className="w-4 h-4 text-[#946A1E]" />
    case 'create_goal':
      return <Target className="w-4 h-4 text-[#1E3345]" />
    case 'suggest_habit':
      return <Flame className="w-4 h-4 text-[#A84232]" />
    case 'organize_daily_plan':
      return <Calendar className="w-4 h-4 text-[#4D327B]" />
    case 'draft_reflection':
      return <BookOpen className="w-4 h-4 text-[#73355A]" />
    default:
      return <Sparkles className="w-4 h-4 text-[#5B3E8C]" />
  }
}

function getActionColorTheme(type: AIActionType) {
  switch (type) {
    case 'create_task':
    case 'update_task':
      return 'border-[#E3EBDD] bg-[#FAF9F6]'
    case 'create_note':
      return 'border-[#F4EBD5] bg-[#FAF9F6]'
    case 'create_goal':
      return 'border-[#DFEAF2] bg-[#FAF9F6]'
    case 'suggest_habit':
      return 'border-[#F4E4DC] bg-[#FAF9F6]'
    case 'organize_daily_plan':
    case 'draft_reflection':
      return 'border-[#E8E1F4] bg-[#FAF9F6]'
    default:
      return 'border-[#EAE6DF] bg-white'
  }
}

export function AIProposedActionCard({
  action,
  onApprove,
  onReject,
  isExecuting = false,
}: AIProposedActionCardProps) {
  const isProposed = action.status === 'proposed'
  const isExecuted = action.status === 'executed'
  const isRejected = action.status === 'rejected'

  const borderClass = getActionColorTheme(action.type)

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all duration-200 mt-3 shadow-xs ${borderClass}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE6DF] flex items-center justify-center shadow-xs">
            {getActionIcon(action.type)}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#85817D]">
              Proposed Action • Approval Required
            </div>
            <div className="text-sm font-medium text-[#33312F]">{action.title}</div>
          </div>
        </div>

        {/* Status Badges */}
        {isExecuted && (
          <PastelBadge variant="sage" size="sm">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#2E6826]" />
            Executed
          </PastelBadge>
        )}
        {isRejected && (
          <PastelBadge variant="peach" size="sm">
            <XCircle className="w-3.5 h-3.5 mr-1 text-[#A84232]" />
            Declined
          </PastelBadge>
        )}
      </div>

      {action.description && (
        <p className="text-xs text-[#524F4A] mb-3 leading-relaxed">{action.description}</p>
      )}

      {/* Structured Details Preview */}
      {action.payload && Object.keys(action.payload).length > 0 && (
        <div className="bg-white/80 rounded-xl p-3 border border-[#EAE6DF]/70 text-xs text-[#524F4A] space-y-1 mb-3">
          {action.payload.title != null && (
            <div className="flex items-center justify-between">
              <span className="text-[#85817D]">Title:</span>
              <span className="font-medium text-[#33312F]">{String(action.payload.title)}</span>
            </div>
          )}
          {action.payload.priority != null && (
            <div className="flex items-center justify-between">
              <span className="text-[#85817D]">Priority:</span>
              <span className="font-medium text-[#33312F]">{String(action.payload.priority)}</span>
            </div>
          )}
          {action.payload.dueDate != null && (
            <div className="flex items-center justify-between">
              <span className="text-[#85817D]">Due Date:</span>
              <span className="font-medium text-[#33312F]">{String(action.payload.dueDate)}</span>
            </div>
          )}
          {action.payload.category != null && (
            <div className="flex items-center justify-between">
              <span className="text-[#85817D]">Category:</span>
              <span className="font-medium text-[#33312F]">{String(action.payload.category)}</span>
            </div>
          )}
          {action.payload.startTime != null && (
            <div className="flex items-center justify-between">
              <span className="text-[#85817D]">Time Slot:</span>
              <span className="font-medium text-[#33312F]">
                {String(action.payload.startTime)} – {String(action.payload.endTime || '')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Message if Executed */}
      {isExecuted && action.resultSummary && (
        <div className="text-xs font-medium text-[#2E6826] bg-[#E3EBDD]/40 p-2.5 rounded-xl border border-[#E3EBDD] mb-1">
          ✓ {action.resultSummary}
        </div>
      )}

      {/* Explicit Human Approval Controls */}
      {isProposed && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6DF]/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReject(action)}
            disabled={isExecuting}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(action)}
            isLoading={isExecuting}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Approve &amp; Execute
          </Button>
        </div>
      )}
    </div>
  )
}
