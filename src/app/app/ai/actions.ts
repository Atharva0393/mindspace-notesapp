'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Json } from '@/types/database'
import {
  AIContextPreferences,
  AIConversation,
  AIMessage,
  AIProposedAction,
  AIServerResponse,
  AISourceReference,
  AIDailyBriefing,
  AIWeeklyReview,
  DEFAULT_AI_CONTEXT_PREFERENCES,
} from '@/types/ai'
import { isGeminiConfigured, generateCompanionResponse } from '@/lib/ai/gemini-client'
import { retrieveRelevantWorkspaceContext } from '@/lib/ai/retriever'
import { collectLocalWorkspaceItems } from '@/lib/ai/workspace-collector'
import { WorkspaceIndexableItem } from '@/lib/ai/indexer'
import { executeApprovedAction, ActionResult } from '@/lib/ai/actions-executor'
import { compileDailyBriefing, compileWeeklyReview } from '@/lib/ai/intelligence'
import { revalidatePath } from 'next/cache'

export interface AIWorkspaceState {
  conversations: AIConversation[]
  activeConversationId: string | null
  messages: AIMessage[]
  preferences: AIContextPreferences
  isSupabaseActive: boolean
  isGeminiActive: boolean
}

/**
 * Fetches conversation list, active message history, and AI preferences.
 */
export async function getAIWorkspaceData(
  conversationId?: string | null
): Promise<AIWorkspaceState> {
  const isSupabase = isSupabaseConfigured()
  const isGemini = isGeminiConfigured()

  let conversations: AIConversation[] = []
  let messages: AIMessage[] = []
  let preferences: AIContextPreferences = {
    userId: 'default-user',
    ...DEFAULT_AI_CONTEXT_PREFERENCES,
  }

  if (isSupabase) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        preferences.userId = user.id

        // Fetch preferences
        const { data: prefData } = await supabase
          .from('ai_context_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (prefData) {
          preferences = {
            userId: user.id,
            includeNotes: prefData.include_notes,
            includeTasks: prefData.include_tasks,
            includeGoals: prefData.include_goals,
            includeHabits: prefData.include_habits,
            includeDailyPlans: prefData.include_daily_plans,
            // Strict journal privacy default
            includeJournal: prefData.include_journal,
          }
        }

        // Fetch conversations
        const { data: convData } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (convData && convData.length > 0) {
          conversations = convData.map((c) => ({
            id: c.id,
            userId: c.user_id,
            title: c.title,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }))
        }

        // Fetch messages for target conversation
        const targetConvId = conversationId || (conversations[0]?.id ?? null)
        if (targetConvId) {
          const { data: msgData } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', targetConvId)
            .order('created_at', { ascending: true })

          if (msgData) {
            messages = msgData.map((m) => ({
              id: m.id,
              conversationId: m.conversation_id,
              role: m.role as 'user' | 'assistant' | 'system',
              content: m.content,
              sources: (m.sources as unknown as AISourceReference[]) || undefined,
              proposedAction: (m.proposed_action as unknown as AIProposedAction) || null,
              createdAt: m.created_at,
            }))
          }
        }
      }
    } catch (err) {
      console.warn('[AI Actions] Supabase load error:', err)
    }
  }

  const activeId = conversationId || (conversations[0]?.id ?? null)

  return {
    conversations,
    activeConversationId: activeId,
    messages,
    preferences,
    isSupabaseActive: isSupabase,
    isGeminiActive: isGemini,
  }
}

/**
 * Handles sending a user message, performing RAG retrieval, contacting Gemini,
 * and proposing human-in-the-loop actions.
 */
export async function sendAIMessageAction(
  conversationId: string,
  content: string,
  preferences: AIContextPreferences,
  localItemsFallback?: WorkspaceIndexableItem[]
): Promise<
  AIServerResponse<{
    userMessage: AIMessage
    assistantMessage?: AIMessage
  }>
> {
  const trimmed = content.trim()
  if (!trimmed) {
    return {
      status: 'error',
      error: 'Message content cannot be empty.',
    }
  }

  const userMsgId = `msg-user-${Date.now()}`
  const userMessage: AIMessage = {
    id: userMsgId,
    conversationId,
    role: 'user',
    content: trimmed,
    createdAt: new Date().toISOString(),
  }

  // Check if Gemini is configured.
  // STRICT RULE: If key is missing, report cleanly and do NOT simulate fake successful AI text!
  if (!isGeminiConfigured()) {
    return {
      status: 'gemini_key_missing',
      data: { userMessage },
      message:
        'Live Gemini generation is unavailable because GEMINI_API_KEY is not configured in .env.local. Add your Gemini API key to activate semantic synthesis and AI companion replies.',
      error: 'GEMINI_API_KEY_MISSING',
    }
  }

  // 1. Gather workspace context for RAG
  const isSupabase = isSupabaseConfigured()
  let supabaseClient: SupabaseClient<Database> | null = null
  let userId = preferences.userId || 'default-user'

  if (isSupabase) {
    try {
      supabaseClient = await createClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      if (user) userId = user.id
    } catch {
      // Fallback to local
    }
  }

  // Collect local workspace items if not querying Supabase vector index
  const items = localItemsFallback || collectLocalWorkspaceItems(userId)

  // 2. Perform semantic context retrieval respecting user AI preferences
  const { sources, contextChunks } = await retrieveRelevantWorkspaceContext({
    query: trimmed,
    userId,
    preferences,
    supabase: supabaseClient,
    localItems: items,
  })

  // 3. Contact Gemini on the server
  const geminiResponse = await generateCompanionResponse({
    userMessage: trimmed,
    contextChunks,
    sources,
  })

  if (geminiResponse.status !== 'success' || !geminiResponse.data) {
    return {
      status: geminiResponse.status,
      error: geminiResponse.error,
      message: geminiResponse.message,
      data: { userMessage },
    }
  }

  const assistantMessage = geminiResponse.data.message
  assistantMessage.conversationId = conversationId

  // 4. If Supabase is active, persist messages to database
  if (isSupabase && supabaseClient) {
    try {
      await supabaseClient.from('ai_messages').insert([
        {
          id: userMessage.id,
          conversation_id: conversationId,
          user_id: userId,
          role: 'user',
          content: userMessage.content,
        },
        {
          id: assistantMessage.id,
          conversation_id: conversationId,
          user_id: userId,
          role: 'assistant',
          content: assistantMessage.content,
          sources: (assistantMessage.sources || []) as unknown as Json,
          proposed_action: (assistantMessage.proposedAction || null) as unknown as Json,
        },
      ])

      // Update conversation timestamp
      await supabaseClient
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    } catch (err) {
      console.warn('[AI Actions] Database message insert failed:', err)
    }
  }

  revalidatePath('/app/ai')

  return {
    status: 'success',
    data: {
      userMessage,
      assistantMessage,
    },
  }
}

/**
 * Creates a new conversation.
 */
export async function createConversationAction(
  title = 'New Conversation'
): Promise<AIServerResponse<{ conversation: AIConversation }>> {
  const convId = `conv-${Date.now()}`
  const now = new Date().toISOString()

  let userId = 'default-user'

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        await supabase.from('ai_conversations').insert({
          id: convId,
          user_id: user.id,
          title,
          created_at: now,
          updated_at: now,
        })
      }
    } catch (err) {
      console.warn('[AI Actions] Could not insert conversation:', err)
    }
  }

  const conversation: AIConversation = {
    id: convId,
    userId,
    title,
    createdAt: now,
    updatedAt: now,
  }

  revalidatePath('/app/ai')

  return {
    status: 'success',
    data: { conversation },
  }
}

/**
 * Deletes a conversation and its messages.
 */
export async function deleteConversationAction(
  conversationId: string
): Promise<AIServerResponse<boolean>> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      await supabase.from('ai_conversations').delete().eq('id', conversationId)
    } catch (err) {
      console.warn('[AI Actions] Delete conversation failed:', err)
    }
  }

  revalidatePath('/app/ai')
  return { status: 'success', data: true }
}

/**
 * Updates the user's AI privacy preferences.
 */
export async function updateAIPreferencesAction(
  preferences: AIContextPreferences
): Promise<AIServerResponse<AIContextPreferences>> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('ai_context_preferences').upsert({
          user_id: user.id,
          include_notes: preferences.includeNotes,
          include_tasks: preferences.includeTasks,
          include_goals: preferences.includeGoals,
          include_habits: preferences.includeHabits,
          include_daily_plans: preferences.includeDailyPlans,
          include_journal: preferences.includeJournal,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.warn('[AI Actions] Upsert preferences failed:', err)
    }
  }

  revalidatePath('/app/ai')
  return { status: 'success', data: preferences }
}

/**
 * Human-in-the-Loop Action Approval:
 * Executes an action ONLY after explicit user confirmation.
 */
export async function executeProposedActionAction(
  messageId: string,
  action: AIProposedAction
): Promise<AIServerResponse<ActionResult>> {
  let userId = 'default-user'

  let supabaseClient: SupabaseClient<Database> | null = null

  if (isSupabaseConfigured()) {
    try {
      supabaseClient = await createClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      if (user) userId = user.id
    } catch {
      // Fallback
    }
  }

  // Execute action securely with user ownership verification
  const result = await executeApprovedAction(action, userId, supabaseClient as unknown as Parameters<typeof executeApprovedAction>[2])

  if (result.success && isSupabaseConfigured() && supabaseClient) {
    try {
      const updatedAction: AIProposedAction = {
        ...action,
        status: 'executed',
        executedAt: new Date().toISOString(),
        resultSummary: result.summary,
      }

      await supabaseClient
        .from('ai_messages')
        .update({ proposed_action: updatedAction as unknown as Json })
        .eq('id', messageId)
    } catch (err) {
      console.warn('[AI Actions] Could not update message action status:', err)
    }
  }

  revalidatePath('/app/ai')
  return { status: result.success ? 'success' : 'error', data: result, error: result.error }
}

/**
 * Human-in-the-Loop Action Rejection:
 * Marks action rejected without making any changes to user records.
 */
export async function rejectProposedActionAction(
  messageId: string,
  action: AIProposedAction
): Promise<AIServerResponse<boolean>> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const updatedAction: AIProposedAction = {
        ...action,
        status: 'rejected',
      }

      await supabase
        .from('ai_messages')
        .update({ proposed_action: updatedAction as unknown as Json })
        .eq('id', messageId)
    } catch (err) {
      console.warn('[AI Actions] Could not mark action rejected in database:', err)
    }
  }

  revalidatePath('/app/ai')
  return { status: 'success', data: true }
}

/**
 * Daily Briefing Generation Action
 */
export async function generateDailyBriefingAction(): Promise<AIServerResponse<AIDailyBriefing>> {
  const briefing = await compileDailyBriefing()
  return { status: 'success', data: briefing }
}

/**
 * Weekly Review Generation Action
 */
export async function generateWeeklyReviewAction(): Promise<AIServerResponse<AIWeeklyReview>> {
  const review = await compileWeeklyReview()
  return { status: 'success', data: review }
}

/**
 * Semantic Natural-Language Search Action
 */
export async function semanticSearchAction(
  query: string,
  preferences: AIContextPreferences,
  localItemsFallback?: WorkspaceIndexableItem[]
): Promise<AIServerResponse<{ results: AISourceReference[] }>> {
  const isSupabase = isSupabaseConfigured()
  let supabaseClient: SupabaseClient<Database> | null = null
  let userId = preferences.userId || 'default-user'

  if (isSupabase) {
    try {
      supabaseClient = await createClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      if (user) userId = user.id
    } catch {
      // Fallback
    }
  }

  const items = localItemsFallback || collectLocalWorkspaceItems(userId)

  const { sources } = await retrieveRelevantWorkspaceContext({
    query,
    userId,
    preferences,
    supabase: supabaseClient,
    localItems: items,
    limit: 12,
  })

  return { status: 'success', data: { results: sources } }
}
