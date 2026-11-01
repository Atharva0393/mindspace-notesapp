'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Send,
  SlidersHorizontal,
  Search,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  StickyNote,
  CheckSquare,
  Target,
  Flame,
  Calendar,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AIProposedActionCard } from './ai-proposed-action-card'
import {
  AIMessage,
  AIProposedAction,
  AIContextPreferences,
  KnowledgeSourceType,
} from '@/types/ai'

interface AIChatInterfaceProps {
  conversationTitle: string
  messages: AIMessage[]
  preferences: AIContextPreferences
  isGeminiActive: boolean
  isSending: boolean
  onSendMessage: (text: string) => void
  onApproveAction: (messageId: string, action: AIProposedAction) => void
  onRejectAction: (messageId: string, action: AIProposedAction) => void
  onOpenPreferences: () => void
  onOpenSemanticSearch: () => void
  onRetryMessage?: (content: string) => void
}

function getSourceIcon(sourceType: KnowledgeSourceType) {
  switch (sourceType) {
    case 'note':
      return <StickyNote className="w-3.5 h-3.5 text-[#946A1E]" />
    case 'task':
      return <CheckSquare className="w-3.5 h-3.5 text-[#2E6826]" />
    case 'goal':
      return <Target className="w-3.5 h-3.5 text-[#1E3345]" />
    case 'habit':
      return <Flame className="w-3.5 h-3.5 text-[#A84232]" />
    case 'daily_plan':
      return <Calendar className="w-3.5 h-3.5 text-[#4D327B]" />
    case 'journal':
      return <BookOpen className="w-3.5 h-3.5 text-[#73355A]" />
  }
}

export function AIChatInterface({
  conversationTitle,
  messages,
  preferences,
  isGeminiActive,
  isSending,
  onSendMessage,
  onApproveAction,
  onRejectAction,
  onOpenPreferences,
  onOpenSemanticSearch,
  onRetryMessage,
}: AIChatInterfaceProps) {
  const [inputText, setInputText] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isSending])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isSending) return
    onSendMessage(inputText)
    setInputText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const starterPrompts = [
    {
      title: "Today's Priorities",
      prompt: 'What are my highest priority tasks and focus items today?',
    },
    {
      title: 'Active Goals',
      prompt: 'Summarize my active goals and current milestone progress.',
    },
    {
      title: 'Habit Streaks',
      prompt: 'Which habits do I need to complete today to maintain my streaks?',
    },
    {
      title: 'Schedule Focus Block',
      prompt: 'Help me plan tomorrow morning: schedule a 90-minute focus block for deep work.',
    },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF9F6] min-w-0">
      {/* Workspace Header Bar */}
      <div className="h-16 px-4 sm:px-6 bg-white border-b border-[#EAE6DF] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#E8E1F4] flex items-center justify-center text-[#5B3E8C] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#33312F] truncate">
              {conversationTitle || 'AI Companion Dialogue'}
            </div>
            {/* Active Context Badges */}
            <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
              <span className="text-[11px] text-[#85817D]">Context:</span>
              {preferences.includeNotes && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#EAE6DF] text-[#524F4A]">
                  Notes
                </span>
              )}
              {preferences.includeTasks && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#EAE6DF] text-[#524F4A]">
                  Tasks
                </span>
              )}
              {preferences.includeGoals && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#EAE6DF] text-[#524F4A]">
                  Goals
                </span>
              )}
              {preferences.includeHabits && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#EAE6DF] text-[#524F4A]">
                  Habits
                </span>
              )}
              {preferences.includeDailyPlans && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#EAE6DF] text-[#524F4A]">
                  Planner
                </span>
              )}
              {preferences.includeJournal && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0DFE8] text-[#73355A]">
                  Journal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSemanticSearch}
            leftIcon={<Search className="w-3.5 h-3.5 text-[#85817D]" />}
            className="hidden sm:inline-flex"
          >
            Search
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenPreferences}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-[#85817D]" />}
          >
            Context
          </Button>
        </div>
      </div>

      {/* Missing Gemini Key Warning Banner */}
      {!isGeminiActive && (
        <div className="m-4 mb-0 rounded-2xl bg-[#F4EBD5]/40 border border-[#F4EBD5] p-4 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-[#946A1E] shrink-0 mt-0.5" />
          <div className="text-xs text-[#524F4A] leading-relaxed">
            <span className="font-semibold text-[#33312F]">
              Gemini API Key Required for Live AI Generation:
            </span>{' '}
            To activate real-time conversational responses and vector embeddings, add{' '}
            <code className="px-1.5 py-0.5 rounded bg-white border border-[#EAE6DF] font-mono text-[11px]">
              GEMINI_API_KEY
            </code>{' '}
            to your{' '}
            <code className="px-1.5 py-0.5 rounded bg-white border border-[#EAE6DF] font-mono text-[11px]">
              .env.local
            </code>{' '}
            file. Context retrieval, semantic indexing, and human-in-the-loop action workflows are
            fully active.
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto py-12 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#E8E1F4] flex items-center justify-center text-[#5B3E8C] mx-auto shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#33312F]">
                How can I assist your productivity today?
              </h2>
              <p className="text-xs text-[#85817D] mt-1 max-w-sm mx-auto">
                Ask questions about your notes, review your daily priorities, or propose new actions
                for approval.
              </p>
            </div>

            {/* Quick Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {starterPrompts.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(starter.prompt)}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-[#EAE6DF] transition-all duration-150 text-left shadow-xs hover:border-[#85817D]/40 group"
                >
                  <div className="text-xs font-semibold text-[#33312F] group-hover:text-[#5B3E8C]">
                    {starter.title}
                  </div>
                  <div className="text-[11px] text-[#85817D] mt-1 line-clamp-2">
                    {starter.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user'

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : ''}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#E8E1F4] flex items-center justify-center text-[#5B3E8C] shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 sm:p-5 transition-all duration-150 shadow-xs ${
                    isUser
                      ? 'bg-[#33312F] text-white max-w-lg'
                      : 'bg-white border border-[#EAE6DF] text-[#33312F] flex-1'
                  }`}
                >
                  {/* Message Content */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* Retrieved Sources Citations */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#EAE6DF] space-y-1.5">
                      <div className="text-[11px] font-semibold text-[#85817D] uppercase tracking-wider">
                        Retrieved Sources:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src) => (
                          <Link
                            key={src.id}
                            href={src.url || '#'}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FAF9F6] hover:bg-[#EAE6DF]/60 border border-[#EAE6DF] text-[11px] text-[#524F4A] transition-colors"
                          >
                            {getSourceIcon(src.sourceType)}
                            <span className="font-medium truncate max-w-[150px]">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-[#85817D]" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proposed Human-in-the-Loop Action */}
                  {!isUser && msg.proposedAction && (
                    <AIProposedActionCard
                      action={msg.proposedAction}
                      onApprove={(action) => onApproveAction(msg.id, action)}
                      onReject={(action) => onRejectAction(msg.id, action)}
                    />
                  )}

                  {/* Message Actions (Copy & Retry) */}
                  {!isUser && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EAE6DF]/60 text-xs text-[#85817D]">
                      <span className="text-[10px]">Gemini Companion</span>
                      <div className="flex items-center gap-2">
                        {msg.error && onRetryMessage && (
                          <button
                            type="button"
                            onClick={() => onRetryMessage(msg.content)}
                            className="flex items-center gap-1 hover:text-[#33312F] transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Retry
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-[#33312F] transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#2E6826]" />
                              <span className="text-[#2E6826]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Loading Spinner Indicator */}
        {isSending && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-7 h-7 rounded-xl bg-[#E8E1F4] flex items-center justify-center text-[#5B3E8C] shrink-0 mt-0.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="rounded-2xl p-4 bg-white border border-[#EAE6DF] text-xs text-[#85817D] flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#5B3E8C] animate-ping" />
              <span>Synthesizing workspace context &amp; drafting response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-[#EAE6DF] shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your notes or request an action..."
              rows={2}
              className="w-full resize-none p-3 pr-10 rounded-2xl bg-[#FAF9F6] border border-[#EAE6DF] text-xs sm:text-sm text-[#33312F] placeholder-[#85817D] focus:outline-none focus:ring-2 focus:ring-[#85817D]/20 focus:border-[#85817D]"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            aria-label="Send message"
            className="w-11 h-11 rounded-2xl bg-[#33312F] hover:bg-[#33312F]/90 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
