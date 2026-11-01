'use client'

import React, { useState } from 'react'
import {
  MessageSquare,
  Plus,
  Trash2,
  SlidersHorizontal,
  SunMedium,
  CalendarRange,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { AIConversation } from '@/types/ai'

interface AISidebarProps {
  conversations: AIConversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onOpenPreferences: () => void
  onOpenBriefing: () => void
  onOpenWeeklyReview: () => void
  onOpenSemanticSearch: () => void
}

export function AISidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenPreferences,
  onOpenBriefing,
  onOpenWeeklyReview,
  onOpenSemanticSearch,
}: AISidebarProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      onDeleteConversation(deleteTargetId)
      setDeleteTargetId(null)
    }
  }

  return (
    <>
      <div className="w-full lg:w-72 shrink-0 flex flex-col h-full bg-[#FAF9F6] border-r border-[#EAE6DF] p-3 space-y-4">
        {/* Top Action: New Dialogue */}
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-center"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onNewConversation}
        >
          New Conversation
        </Button>

        {/* Intelligence Quick Jump Tools */}
        <div className="space-y-1 pt-1">
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[#85817D]">
            Intelligence Tools
          </div>

          <button
            type="button"
            onClick={onOpenBriefing}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#33312F] hover:bg-[#EAE6DF]/50 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-[#F4E4DC] flex items-center justify-center text-[#A84232]">
              <SunMedium className="w-3.5 h-3.5" />
            </div>
            <span>Daily Morning Briefing</span>
          </button>

          <button
            type="button"
            onClick={onOpenWeeklyReview}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#33312F] hover:bg-[#EAE6DF]/50 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-[#E8E1F4] flex items-center justify-center text-[#4D327B]">
              <CalendarRange className="w-3.5 h-3.5" />
            </div>
            <span>Weekly Retrospective</span>
          </button>

          <button
            type="button"
            onClick={onOpenSemanticSearch}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#33312F] hover:bg-[#EAE6DF]/50 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-[#DFEAF2] flex items-center justify-center text-[#1E3345]">
              <Search className="w-3.5 h-3.5" />
            </div>
            <span>Semantic Knowledge Search</span>
          </button>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 min-h-0 flex flex-col pt-2">
          <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#85817D] flex items-center justify-between">
            <span>Conversations</span>
            <span className="text-[10px] text-[#85817D]">{conversations.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#85817D]">No conversations yet.</div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId
                return (
                  <div
                    key={conv.id}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white shadow-xs border border-[#EAE6DF] font-medium text-[#33312F]'
                        : 'text-[#524F4A] hover:bg-[#EAE6DF]/40'
                    }`}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-6">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#85817D]" />
                      <span className="truncate">{conv.title || 'Untitled Dialogue'}</span>
                    </div>

                    <button
                      type="button"
                      aria-label="Delete conversation"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTargetId(conv.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#85817D] hover:text-[#A84232] rounded-md transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Bottom Context Settings Trigger */}
        <div className="pt-2 border-t border-[#EAE6DF]">
          <button
            type="button"
            onClick={onOpenPreferences}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#FAF9F6] text-xs font-medium text-[#33312F] transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#85817D]" />
              <span>AI Context &amp; Privacy</span>
            </div>
            <span className="text-[11px] text-[#85817D]">Manage</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This will permanently remove its message history."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#EAE6DF]">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTargetId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
