'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { AISidebar } from '@/components/modules/ai/ai-sidebar'
import { AIChatInterface } from '@/components/modules/ai/ai-chat-interface'
import { AIContextSettingsModal } from '@/components/modules/ai/ai-context-settings-modal'
import { AIBriefingModal } from '@/components/modules/ai/ai-briefing-modal'
import { AIWeeklyReviewModal } from '@/components/modules/ai/ai-weekly-review-modal'
import { SemanticSearchModal } from '@/components/modules/ai/semantic-search-modal'
import { useToast } from '@/components/ui/toast'
import {
  AIConversation,
  AIMessage,
  AIContextPreferences,
  AIProposedAction,
  AIDailyBriefing,
  AIWeeklyReview,
  DEFAULT_AI_CONTEXT_PREFERENCES,
} from '@/types/ai'
import {
  getAIWorkspaceData,
  sendAIMessageAction,
  createConversationAction,
  deleteConversationAction,
  updateAIPreferencesAction,
  executeProposedActionAction,
  rejectProposedActionAction,
  generateDailyBriefingAction,
  generateWeeklyReviewAction,
} from './actions'
import {
  getLocalAIPreferences,
  saveLocalAIPreferences,
  getLocalAIConversations,
  saveLocalAIConversations,
  getLocalAIMessages,
  saveLocalAIMessage,
  updateLocalAIMessageAction,
} from '@/lib/workspace/store'

export default function AIPage() {
  const { toast } = useToast()
  const [, startTransition] = useTransition()

  // State
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [preferences, setPreferences] = useState<AIContextPreferences>({
    userId: 'default-user',
    ...DEFAULT_AI_CONTEXT_PREFERENCES,
  })
  const [isGeminiActive, setIsGeminiActive] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isBriefingLoading, setIsBriefingLoading] = useState(false)
  const [isReviewLoading, setIsReviewLoading] = useState(false)

  // Modals
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false)
  const [semanticSearchOpen, setSemanticSearchOpen] = useState(false)

  // Intelligence data
  const [briefing, setBriefing] = useState<AIDailyBriefing | null>(null)
  const [weeklyReview, setWeeklyReview] = useState<AIWeeklyReview | null>(null)

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const workspaceData = await getAIWorkspaceData()
        setIsGeminiActive(workspaceData.isGeminiActive)

        if (workspaceData.conversations.length > 0) {
          setConversations(workspaceData.conversations)
          setActiveConversationId(workspaceData.activeConversationId)
          setMessages(workspaceData.messages)
          setPreferences(workspaceData.preferences)
        } else {
          // Fallback to local store
          const localConvs = getLocalAIConversations()
          const localPrefs = getLocalAIPreferences()
          setConversations(localConvs)
          setActiveConversationId(localConvs[0]?.id || null)
          setPreferences(localPrefs)
          if (localConvs[0]?.id) {
            setMessages(getLocalAIMessages(localConvs[0].id))
          }
        }
      } catch (err) {
        console.warn('Fallback to local AI store:', err)
        const localConvs = getLocalAIConversations()
        const localPrefs = getLocalAIPreferences()
        setConversations(localConvs)
        setActiveConversationId(localConvs[0]?.id || null)
        setPreferences(localPrefs)
        if (localConvs[0]?.id) {
          setMessages(getLocalAIMessages(localConvs[0].id))
        }
      }
    }

    loadData()
  }, [])

  // Switch conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id)
    startTransition(async () => {
      try {
        const workspaceData = await getAIWorkspaceData(id)
        if (workspaceData.messages.length > 0) {
          setMessages(workspaceData.messages)
        } else {
          setMessages(getLocalAIMessages(id))
        }
      } catch {
        setMessages(getLocalAIMessages(id))
      }
    })
  }

  // Create new conversation
  const handleNewConversation = async () => {
    const res = await createConversationAction('New Conversation')
    if (res.status === 'success' && res.data) {
      const newConv = res.data.conversation
      const updated = [newConv, ...conversations]
      setConversations(updated)
      saveLocalAIConversations(updated)
      setActiveConversationId(newConv.id)
      setMessages([])
      toast({ title: 'Created new conversation', variant: 'success' })
    }
  }

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    await deleteConversationAction(id)
    const updated = conversations.filter((c) => c.id !== id)
    setConversations(updated)
    saveLocalAIConversations(updated)

    if (activeConversationId === id) {
      const nextId = updated[0]?.id || null
      setActiveConversationId(nextId)
      if (nextId) {
        setMessages(getLocalAIMessages(nextId))
      } else {
        setMessages([])
      }
    }
    toast({ title: 'Conversation deleted', variant: 'default' })
  }

  // Save AI preferences
  const handleSavePreferences = async (updated: AIContextPreferences) => {
    setPreferences(updated)
    saveLocalAIPreferences(updated)
    await updateAIPreferencesAction(updated)
    toast({ title: 'AI context preferences updated', variant: 'success' })
  }

  // Send message
  const handleSendMessage = async (text: string) => {
    let convId = activeConversationId
    if (!convId) {
      const res = await createConversationAction(text.slice(0, 30))
      if (res.status === 'success' && res.data) {
        convId = res.data.conversation.id
        setActiveConversationId(convId)
        setConversations([res.data.conversation, ...conversations])
      } else {
        return
      }
    }

    setIsSending(true)

    // Optimistic user message with valid UUID
    const userMsgId = crypto.randomUUID()
    const tempUserMsg: AIMessage = {
      id: userMsgId,
      conversationId: convId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempUserMsg])
    saveLocalAIMessage(tempUserMsg)

    try {
      const result = await sendAIMessageAction(convId, text, preferences, undefined, userMsgId)

      if (result.status === 'gemini_key_missing') {
        const noticeMsg: AIMessage = {
          id: crypto.randomUUID(),
          conversationId: convId,
          role: 'assistant',
          content:
            '⚠️ **Gemini API Key Required**\n\nLive generative replies are paused because `GEMINI_API_KEY` is not present in `.env.local`.\n\nPlease add your API key to `.env.local` and restart the Next.js server to ask questions across your notes and workspace.',
          createdAt: new Date().toISOString(),
          error: 'GEMINI_KEY_MISSING',
        }
        setMessages((prev) => [...prev, noticeMsg])
        saveLocalAIMessage(noticeMsg)
      } else if (result.status === 'success' && result.data?.assistantMessage) {
        if (result.data.conversationId && result.data.conversationId !== convId) {
          setActiveConversationId(result.data.conversationId)
        }
        const assistantMsg = result.data.assistantMessage
        setMessages((prev) => [...prev, assistantMsg])
        saveLocalAIMessage(assistantMsg)
      } else {
        const errorMsg: AIMessage = {
          id: crypto.randomUUID(),
          conversationId: convId,
          role: 'assistant',
          content: result.error || 'Failed to contact Gemini API. Please try again.',
          createdAt: new Date().toISOString(),
          error: 'ERROR',
        }
        setMessages((prev) => [...prev, errorMsg])
        saveLocalAIMessage(errorMsg)
      }
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      const errorMsg: AIMessage = {
        id: crypto.randomUUID(),
        conversationId: convId,
        role: 'assistant',
        content: `Error: ${errorObj.message || 'Network error occurred.'}`,
        createdAt: new Date().toISOString(),
        error: 'NETWORK_ERROR',
      }
      setMessages((prev) => [...prev, errorMsg])
      saveLocalAIMessage(errorMsg)
    } finally {
      setIsSending(false)
    }
  }

  // Human-in-the-Loop Action Approval
  const handleApproveAction = async (messageId: string, action: AIProposedAction) => {
    try {
      const res = await executeProposedActionAction(messageId, action)
      if (res.status === 'success' && res.data) {
        const updatedAction: AIProposedAction = {
          ...action,
          status: 'executed',
          executedAt: new Date().toISOString(),
          resultSummary: res.data.summary,
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, proposedAction: updatedAction } : m))
        )
        updateLocalAIMessageAction(messageId, updatedAction)
        toast({ title: res.data.summary, variant: 'success' })
      } else {
        toast({ title: res.error || 'Failed to execute proposed action', variant: 'error' })
      }
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      toast({ title: `Action failed: ${errorObj.message}`, variant: 'error' })
    }
  }

  // Human-in-the-Loop Action Rejection
  const handleRejectAction = async (messageId: string, action: AIProposedAction) => {
    try {
      await rejectProposedActionAction(messageId, action)
      const updatedAction: AIProposedAction = {
        ...action,
        status: 'rejected',
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, proposedAction: updatedAction } : m))
      )
      updateLocalAIMessageAction(messageId, updatedAction)
      toast({ title: 'Action declined', variant: 'default' })
    } catch {
      toast({ title: 'Could not decline action', variant: 'error' })
    }
  }

  // Open Daily Briefing
  const handleOpenBriefing = async () => {
    setBriefingOpen(true)
    setIsBriefingLoading(true)
    try {
      const res = await generateDailyBriefingAction()
      if (res.status === 'success' && res.data) {
        setBriefing(res.data)
      }
    } finally {
      setIsBriefingLoading(false)
    }
  }

  // Open Weekly Review
  const handleOpenWeeklyReview = async () => {
    setWeeklyReviewOpen(true)
    setIsReviewLoading(true)
    try {
      const res = await generateWeeklyReviewAction()
      if (res.status === 'success' && res.data) {
        setWeeklyReview(res.data)
      }
    } finally {
      setIsReviewLoading(false)
    }
  }

  const activeConv = conversations.find((c) => c.id === activeConversationId)

  return (
    <div className="h-[calc(100vh-8.5rem)] rounded-3xl bg-white border border-[#EAE6DF] shadow-xs overflow-hidden flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AISidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenPreferences={() => setPreferencesOpen(true)}
        onOpenBriefing={handleOpenBriefing}
        onOpenWeeklyReview={handleOpenWeeklyReview}
        onOpenSemanticSearch={() => setSemanticSearchOpen(true)}
      />

      {/* Main Chat Interface */}
      <AIChatInterface
        conversationTitle={activeConv?.title || 'AI Companion'}
        messages={messages}
        preferences={preferences}
        isGeminiActive={isGeminiActive}
        isSending={isSending}
        onSendMessage={handleSendMessage}
        onApproveAction={handleApproveAction}
        onRejectAction={handleRejectAction}
        onOpenPreferences={() => setPreferencesOpen(true)}
        onOpenSemanticSearch={() => setSemanticSearchOpen(true)}
        onRetryMessage={handleSendMessage}
      />

      {/* Context & Privacy Settings Modal */}
      <AIContextSettingsModal
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
      />

      {/* Daily Briefing Modal */}
      <AIBriefingModal
        isOpen={briefingOpen}
        onClose={() => setBriefingOpen(false)}
        briefing={briefing}
        isLoading={isBriefingLoading}
        onRefresh={handleOpenBriefing}
      />

      {/* Weekly Review Modal */}
      <AIWeeklyReviewModal
        isOpen={weeklyReviewOpen}
        onClose={() => setWeeklyReviewOpen(false)}
        review={weeklyReview}
        isLoading={isReviewLoading}
        onRefresh={handleOpenWeeklyReview}
      />

      {/* Semantic Search Modal */}
      <SemanticSearchModal
        isOpen={semanticSearchOpen}
        onClose={() => setSemanticSearchOpen(false)}
        preferences={preferences}
      />
    </div>
  )
}
