// Centralized Gemini & AI Engine Configuration

export const AI_CONFIG = {
  // Current models from Google Gen AI
  primaryModel: 'gemini-3.1-flash-lite',
  fallbackModel: 'gemini-3.8-flash',
  embeddingModel: 'gemini-embedding-001',
  embeddingDimensions: 768, // Matryoshka dimension constraint matching pgvector(768)

  // Generation parameters
  temperature: 0.7,
  maxOutputTokens: 2048,
  requestTimeoutMs: 25000,

  // Context & safety boundaries
  maxPromptLength: 16000, // Character limit on user inputs
  maxContextChunks: 6, // Top K chunks to include in RAG prompt
  maxChunkChars: 800, // Chunk length for knowledge indexing
  chunkOverlapChars: 100, // Overlap to preserve semantic continuity
  similarityThreshold: 0.35, // Cosine similarity cutoff for pgvector matching
} as const

