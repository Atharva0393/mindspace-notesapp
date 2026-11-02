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
        } else {
          // Initialize first conversation in Supabase with valid UUIDs for authenticated user
          const welcomeConvId = crypto.randomUUID()
          const welcomeMsgId = crypto.randomUUID()
          const now = new Date().toISOString()
          const { data: createdConv } = await supabase
            .from('ai_conversations')
            .insert({
              id: welcomeConvId,
              user_id: user.id,
              title: 'Workspace Orientation & Focus',
              created_at: now,
              updated_at: now,
            })
            .select()
            .single()

          if (createdConv) {
            conversations = [
              {
                id: createdConv.id,
                userId: createdConv.user_id,
                title: createdConv.title,
                createdAt: createdConv.created_at,
                updatedAt: createdConv.updated_at,
              },
            ]

            const welcomeContent = `Hello! I am your **MINDSPACE AI Companion**.

I can help you reflect on your projects, plan your day, summarize goals, and find connections across your notes.

### Active Workspace Knowledge:
- **Notes & Folders:** Enabled
- **Tasks & Priorities:** Enabled
- **Habits & Streaks:** Enabled
- **Goals & Milestones:** Enabled
- **Daily Planner:** Enabled
- **Mindful Journal:** 🔒 *Disabled by default for your privacy* (you can enable it anytime in Context Settings)

Feel free to ask me questions like:
- *"What are my highest priority tasks today?"*
- *"Summarize my progress on active goals."*
- *"Help me schedule focus time tomorrow morning."*`

            const { data: createdMsg } = await supabase
              .from('ai_messages')
              .insert({
                id: welcomeMsgId,
                conversation_id: welcomeConvId,
                user_id: user.id,
                role: 'assistant',
                content: welcomeContent,
                created_at: now,
              })
              .select()
              .single()

            if (createdMsg) {
              messages = [
                {
                  id: createdMsg.id,
                  conversationId: createdMsg.conversation_id,
                  role: createdMsg.role as 'assistant',
                  content: createdMsg.content,
                  createdAt: createdMsg.created_at,
                },
              ]
            }
          }
        }

        // Fetch messages for target conversation if not already initialized
        const targetConvId = conversationId || (conversations[0]?.id ?? null)
        if (targetConvId && messages.length === 0) {
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
 * Guarantees valid UUIDs for conversations and messages in Supabase.
 */
export async function sendAIMessageAction(
  conversationId: string,
  content: string,
  preferences: AIContextPreferences,
  localItemsFallback?: WorkspaceIndexableItem[],
  clientUserMsgId?: string
): Promise<
  AIServerResponse<{
    userMessage: AIMessage
    assistantMessage?: AIMessage
    conversationId: string
  }>
> {
  const trimmed = content.trim()
  if (!trimmed) {
    return {
      status: 'error',
      error: 'Message content cannot be empty.',
    }
  }

  const isSupabase = isSupabaseConfigured()
  let supabaseClient: SupabaseClient<Database> | null = null
  let authenticatedUser: { id: string } | null = null
  let userId = preferences.userId || 'default-user'

  if (isSupabase) {
    try {
      supabaseClient = await createClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      if (user) {
        authenticatedUser = user
        userId = user.id
      }
    } catch {
      // Fallback
    }
  }

  // Validate or normalize conversationId to a valid UUID
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  let targetConvId = conversationId

  // If conversationId is not a valid UUID (e.g. legacy string), mint a new valid UUID
  if (!UUID_REGEX.test(targetConvId)) {
    targetConvId = crypto.randomUUID()
  }

  // Ensure userMessage has a valid UUID
  const userMsgId =
    clientUserMsgId && UUID_REGEX.test(clientUserMsgId) ? clientUserMsgId : crypto.randomUUID()

  const userMessage: AIMessage = {
    id: userMsgId,
    conversationId: targetConvId,
    role: 'user',
    content: trimmed,
    createdAt: new Date().toISOString(),
  }

  // Check if Gemini is configured.
  // STRICT RULE: If key is missing, report cleanly and do NOT simulate fake successful AI text!
  if (!isGeminiConfigured()) {
    return {
      status: 'gemini_key_missing',
      data: { userMessage, conversationId: targetConvId },
      message:
        'Live Gemini generation is unavailable because GEMINI_API_KEY is not configured in .env.local. Add your Gemini API key to activate semantic synthesis and AI companion replies.',
      error: 'GEMINI_API_KEY_MISSING',
    }
  }

  // 1. If authenticated, ensure conversation row exists before inserting messages
  if (isSupabase && supabaseClient && authenticatedUser) {
    try {
      const { data: convExists } = await supabaseClient
        .from('ai_conversations')
        .select('id, title')
        .eq('id', targetConvId)
        .eq('user_id', authenticatedUser.id)
        .maybeSingle()

      if (!convExists) {
        await supabaseClient.from('ai_conversations').insert({
          id: targetConvId,
          user_id: authenticatedUser.id,
          title: trimmed.length > 36 ? `${trimmed.slice(0, 36)}...` : trimmed,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } else if (
        convExists.title === 'New Conversation' ||
        convExists.title === 'Workspace Orientation & Focus'
      ) {
        // Auto-title conversation based on first message
        const updatedTitle = trimmed.length > 36 ? `${trimmed.slice(0, 36)}...` : trimmed
        await supabaseClient
          .from('ai_conversations')
          .update({ title: updatedTitle })
          .eq('id', targetConvId)
          .eq('user_id', authenticatedUser.id)
      }
    } catch (cErr) {
      console.warn('[AI Actions] Conversation check/create warning:', cErr)
    }
  }

  // 2. Gather workspace context for RAG
  const items = localItemsFallback || collectLocalWorkspaceItems(userId)
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
      data: { userMessage, conversationId: targetConvId },
    }
  }

  const assistantMessage = geminiResponse.data.message
  assistantMessage.conversationId = targetConvId

  // 4. If Supabase is active, persist messages to database atomically with valid UUIDs
  if (isSupabase && supabaseClient && authenticatedUser) {
    try {
      const { error: insertError } = await supabaseClient.from('ai_messages').insert([
        {
          id: userMessage.id,
          conversation_id: targetConvId,
          user_id: authenticatedUser.id,
          role: 'user',
          content: userMessage.content,
        },
        {
          id: assistantMessage.id,
          conversation_id: targetConvId,
          user_id: authenticatedUser.id,
          role: 'assistant',
          content: assistantMessage.content,
          sources: (assistantMessage.sources || []) as unknown as Json,
          proposed_action: (assistantMessage.proposedAction || null) as unknown as Json,
        },
      ])

      if (insertError) {
        console.error('[AI Actions] Database message insert failed:', insertError.message)
      } else {
        // Update conversation timestamp
        await supabaseClient
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', targetConvId)
          .eq('user_id', authenticatedUser.id)
      }
    } catch (err) {
      console.error('[AI Actions] Database message insert exception:', err)
    }
  }

  revalidatePath('/app/ai')

  return {
    status: 'success',
    data: {
      userMessage,
      assistantMessage,
      conversationId: targetConvId,
    },
  }
}

/**
 * Creates a new conversation using valid UUID.
 */
export async function createConversationAction(
  title = 'New Conversation'
): Promise<AIServerResponse<{ conversation: AIConversation }>> {
  const convId = crypto.randomUUID()
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
        const { error: insertError } = await supabase.from('ai_conversations').insert({
          id: convId,
          user_id: user.id,
          title,
          created_at: now,
          updated_at: now,
        })

        if (insertError) {
          console.error('[AI Actions] Could not insert conversation:', insertError.message)
          return { status: 'error', error: insertError.message }
        }
      }
    } catch (err) {
      console.error('[AI Actions] Could not insert conversation:', err)
      return { status: 'error', error: (err as Error).message }
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from('ai_conversations')
          .delete()
          .eq('id', conversationId)
          .eq('user_id', user.id)

        if (error) {
          console.error('[AI Actions] Delete conversation failed:', error.message)
          return { status: 'error', error: error.message }
        }
      }
    } catch (err) {
      console.error('[AI Actions] Delete conversation exception:', err)
      return { status: 'error', error: (err as Error).message }
    }
  }

  revalidatePath('/app/ai')
  return { status: 'success', data: true }
}

/**
 * Updates the user's AI privacy preferences.
 * Purges journal chunks immediately if journal preference is toggled off.
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
        const { error: upsertError } = await supabase.from('ai_context_preferences').upsert({
          user_id: user.id,
          include_notes: preferences.includeNotes,
          include_tasks: preferences.includeTasks,
          include_goals: preferences.includeGoals,
          include_habits: preferences.includeHabits,
          include_daily_plans: preferences.includeDailyPlans,
          include_journal: preferences.includeJournal,
          updated_at: new Date().toISOString(),
        })

        if (upsertError) {
          console.error('[AI Actions] Upsert preferences error:', upsertError.message)
        }

        // Strict privacy enforcement: Purge any journal chunks immediately if toggled off
        if (!preferences.includeJournal) {
          await supabase
            .from('ai_knowledge_chunks')
            .delete()
            .eq('user_id', user.id)
            .eq('source_type', 'journal')
        }
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
