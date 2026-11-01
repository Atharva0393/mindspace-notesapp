import { GoogleGenAI } from '@google/genai'
import { AI_CONFIG } from './config'
import {
  AIMessage,
  AIProposedAction,
  AIServerResponse,
  AISourceReference,
} from '@/types/ai'
import { COMPANION_SYSTEM_PROMPT, buildContextAugmentedPrompt } from './prompts'

// Cache client instance on the server
let genAIClient: GoogleGenAI | null = null

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY
  return typeof key === 'string' && key.trim().length > 0 && !key.includes('your-gemini-api-key')
}

export function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) {
    return null
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  }
  return genAIClient
}

/**
 * Extracts structured action proposals from model text.
 * Expects ```action { ... } ``` or ```json { ... } ``` containing an action type.
 */
export function extractProposedAction(rawText: string): {
  cleanContent: string
  action: AIProposedAction | null
} {
  const actionRegex = /```(?:action|json)\s*(\{[\s\S]*?"type"\s*:\s*"(?:create_task|create_note|update_task|create_goal|suggest_habit|organize_daily_plan|draft_reflection)"[\s\S]*?\})\s*```/i
  const match = rawText.match(actionRegex)

  if (!match) {
    return { cleanContent: rawText.trim(), action: null }
  }

  try {
    const parsed = JSON.parse(match[1])
    if (!parsed.type) {
      return { cleanContent: rawText.trim(), action: null }
    }

    const action: AIProposedAction = {
      id: `action-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: parsed.type,
      title: parsed.title || `Execute ${parsed.type.replace('_', ' ')}`,
      description: parsed.description || 'Action proposed by AI Companion',
      payload: parsed.payload || {},
      status: 'proposed',
    }

    // Cleanly strip the action code block from the conversational text
    const cleanContent = rawText.replace(match[0], '').trim()
    return { cleanContent, action }
  } catch {
    // If JSON parsing fails, retain original text without failing the conversation
    return { cleanContent: rawText.trim(), action: null }
  }
}

/**
 * Generates an embedding vector using text-embedding-004 (768 dimensions).
 * Returns null if Gemini is not configured or if an error occurs.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getGeminiClient()
  if (!client || !text || text.trim().length === 0) {
    return null
  }

  try {
    // Truncate to safe character length to prevent context explosion
    const safeText = text.slice(0, 2048)
    const response = await client.models.embedContent({
      model: AI_CONFIG.embeddingModel,
      contents: safeText,
      config: {
        outputDimensionality: AI_CONFIG.embeddingDimensions,
      },
    })

    const values =
      response.embeddings?.[0]?.values ||
      (response as { embedding?: { values?: number[] } }).embedding?.values ||
      null

    return Array.isArray(values) ? values : null
  } catch (err) {
    // Graceful degradation: never crash on embedding failure
    console.warn('[Gemini Embedding] Generation failed:', (err as Error).message)
    return null
  }
}

/**
 * Generates a response from Gemini with prompt injection defense, timeout, and action parsing.
 */
export async function generateCompanionResponse(options: {
  userMessage: string
  contextChunks: string[]
  sources?: AISourceReference[]
  conversationHistory?: AIMessage[]
}): Promise<AIServerResponse<{ message: AIMessage }>> {
  if (!isGeminiConfigured()) {
    return {
      status: 'gemini_key_missing',
      error: 'GEMINI_API_KEY is not configured in your environment.',
      message:
        'Live Gemini intelligence is disabled because GEMINI_API_KEY is missing. Add your Gemini API key to .env.local to enable conversational responses and pgvector embeddings.',
    }
  }

  const client = getGeminiClient()
  if (!client) {
    return {
      status: 'gemini_key_missing',
      error: 'Could not initialize Google Gen AI client.',
    }
  }

  // Safety boundaries: validate prompt length
  if (options.userMessage.length > AI_CONFIG.maxPromptLength) {
    return {
      status: 'context_length_exceeded',
      error: `Message exceeds maximum allowed character length (${AI_CONFIG.maxPromptLength}).`,
    }
  }

  const promptWithContext = buildContextAugmentedPrompt(
    options.userMessage,
    options.contextChunks
  )

  try {
    // Wrap with timeout to prevent hanging connections
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Request timed out while waiting for Gemini API response.')),
        AI_CONFIG.requestTimeoutMs
      )
    )

    // Execute generation with primary model (and automatic fallback if unavailable)
    const runGeneration = async () => {
      try {
        return await client.models.generateContent({
          model: AI_CONFIG.primaryModel,
          contents: promptWithContext,
          config: {
            systemInstruction: COMPANION_SYSTEM_PROMPT,
            temperature: AI_CONFIG.temperature,
            maxOutputTokens: AI_CONFIG.maxOutputTokens,
          },
        })
      } catch (primaryErr: unknown) {
        console.warn(
          `[Gemini Client] Primary model ${AI_CONFIG.primaryModel} failed, trying fallback ${AI_CONFIG.fallbackModel}:`,
          (primaryErr as Error).message
        )
        return await client.models.generateContent({
          model: AI_CONFIG.fallbackModel,
          contents: promptWithContext,
          config: {
            systemInstruction: COMPANION_SYSTEM_PROMPT,
            temperature: AI_CONFIG.temperature,
            maxOutputTokens: AI_CONFIG.maxOutputTokens,
          },
        })
      }
    }

    const response = await Promise.race([runGeneration(), timeoutPromise])
    const rawText = response.text || ''

    if (!rawText.trim()) {
      return {
        status: 'error',
        error: 'The AI model returned an empty response. Please try rephrasing your message.',
      }
    }

    const { cleanContent, action } = extractProposedAction(rawText)

    const assistantMessage: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId: '', // Filled by caller
      role: 'assistant',
      content: cleanContent,
      sources: options.sources && options.sources.length > 0 ? options.sources : undefined,
      proposedAction: action,
      createdAt: new Date().toISOString(),
    }

    return {
      status: 'success',
      data: { message: assistantMessage },
    }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    const message = errorObj.message || 'Unknown error occurred while contacting Gemini API.'
    console.error('[Gemini API Error]:', message)

    if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
      return {
        status: 'rate_limited',
        error: 'Gemini API rate limit reached. Please pause a moment before asking again.',
      }
    }

    if (message.includes('503') || message.includes('UNAVAILABLE') || message.includes('timed out')) {
      return {
        status: 'service_unavailable',
        error: 'The AI service is temporarily unavailable or timed out. Please try again in a few moments.',
      }
    }

    return {
      status: 'error',
      error: `AI generation failed: ${message}`,
    }
  }
}
