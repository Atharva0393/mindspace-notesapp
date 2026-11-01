export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          content_json: Json | null
          color_theme: string
          is_pinned: boolean
          is_favorite: boolean
          is_archived: boolean
          is_trashed: boolean
          tags: string[]
          folder_id: string | null
          embedding: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          content?: string
          content_json?: Json | null
          color_theme?: string
          is_pinned?: boolean
          is_favorite?: boolean
          is_archived?: boolean
          is_trashed?: boolean
          tags?: string[]
          folder_id?: string | null
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          content_json?: Json | null
          color_theme?: string
          is_pinned?: boolean
          is_favorite?: boolean
          is_archived?: boolean
          is_trashed?: boolean
          tags?: string[]
          folder_id?: string | null
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      note_links: {
        Row: {
          id: string
          user_id: string
          source_note_id: string
          target_note_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_note_id: string
          target_note_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_note_id?: string
          target_note_id?: string
          created_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          color_theme: string
          target_date: string | null
          progress: number
          milestones: Json | null
          linked_note_ids: string[]
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          color_theme?: string
          target_date?: string | null
          progress?: number
          milestones?: Json | null
          linked_note_ids?: string[]
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          color_theme?: string
          target_date?: string | null
          progress?: number
          milestones?: Json | null
          linked_note_ids?: string[]
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          title: string
          description: string | null
          priority: 'urgent' | 'high' | 'medium' | 'low'
          status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          due_date: string | null
          due_time: string | null
          project: string | null
          tags: string[]
          recurrence: string
          linked_note_id: string | null
          is_daily_focus: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          title: string
          description?: string | null
          priority?: 'urgent' | 'high' | 'medium' | 'low'
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          due_time?: string | null
          project?: string | null
          tags?: string[]
          recurrence?: string
          linked_note_id?: string | null
          is_daily_focus?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          title?: string
          description?: string | null
          priority?: 'urgent' | 'high' | 'medium' | 'low'
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          due_time?: string | null
          project?: string | null
          tags?: string[]
          recurrence?: string
          linked_note_id?: string | null
          is_daily_focus?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          frequency: string
          schedule_days: number[]
          target_count: number
          color_theme: string
          icon: string | null
          reminder_time: string | null
          is_paused: boolean
          is_archived: boolean
          streak_count: number
          best_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          frequency?: string
          schedule_days?: number[]
          target_count?: number
          color_theme?: string
          icon?: string | null
          reminder_time?: string | null
          is_paused?: boolean
          is_archived?: boolean
          streak_count?: number
          best_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          frequency?: string
          schedule_days?: number[]
          target_count?: number
          color_theme?: string
          icon?: string | null
          reminder_time?: string | null
          is_paused?: boolean
          is_archived?: boolean
          streak_count?: number
          best_streak?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          log_date: string
          status: string
          completed: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          habit_id: string
          log_date: string
          status?: string
          completed?: boolean
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string
          log_date?: string
          status?: string
          completed?: boolean
          completed_at?: string | null
        }
        Relationships: []
      }
      daily_plans: {
        Row: {
          id: string
          user_id: string
          plan_date: string
          morning_intention: string | null
          evening_reflection: string | null
          daily_reflection: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_date: string
          morning_intention?: string | null
          evening_reflection?: string | null
          daily_reflection?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_date?: string
          morning_intention?: string | null
          evening_reflection?: string | null
          daily_reflection?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_blocks: {
        Row: {
          id: string
          user_id: string
          daily_plan_id: string | null
          task_id: string | null
          title: string
          block_date: string
          start_time: string
          end_time: string
          color_theme: string
          notes: string | null
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_plan_id?: string | null
          task_id?: string | null
          title: string
          block_date?: string
          start_time: string
          end_time: string
          color_theme?: string
          notes?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_plan_id?: string | null
          task_id?: string | null
          title?: string
          block_date?: string
          start_time?: string
          end_time?: string
          color_theme?: string
          notes?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          mood: string | null
          title: string | null
          content: string
          content_json: Json | null
          emotions: string[]
          is_favorite: boolean
          color_theme: string
          template_id: string | null
          linked_note_ids: string[]
          gratitude_items: string[]
          prompt_question: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          mood?: string | null
          title?: string | null
          content: string
          content_json?: Json | null
          emotions?: string[]
          is_favorite?: boolean
          color_theme?: string
          template_id?: string | null
          linked_note_ids?: string[]
          gratitude_items?: string[]
          prompt_question?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          mood?: string | null
          title?: string | null
          content?: string
          content_json?: Json | null
          emotions?: string[]
          is_favorite?: boolean
          color_theme?: string
          template_id?: string | null
          linked_note_ids?: string[]
          gratitude_items?: string[]
          prompt_question?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          mood_score: number
          mood_level: string
          emotions: string[]
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          mood_score: number
          mood_level: string
          emotions?: string[]
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          mood_score?: number
          mood_level?: string
          emotions?: string[]
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: string
          content: string
          metadata: Json | null
          sources: Json | null
          proposed_action: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role: string
          content: string
          metadata?: Json | null
          sources?: Json | null
          proposed_action?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: string
          content?: string
          metadata?: Json | null
          sources?: Json | null
          proposed_action?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      ai_context_preferences: {
        Row: {
          id: string
          user_id: string
          include_notes: boolean
          include_tasks: boolean
          include_goals: boolean
          include_habits: boolean
          include_daily_plans: boolean
          include_journal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          include_notes?: boolean
          include_tasks?: boolean
          include_goals?: boolean
          include_habits?: boolean
          include_daily_plans?: boolean
          include_journal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          include_notes?: boolean
          include_tasks?: boolean
          include_goals?: boolean
          include_habits?: boolean
          include_daily_plans?: boolean
          include_journal?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_knowledge_chunks: {
        Row: {
          id: string
          user_id: string
          source_type: string
          source_id: string
          title: string
          content_chunk: string
          chunk_index: number
          metadata: Json
          embedding: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_type: string
          source_id: string
          title: string
          content_chunk: string
          chunk_index?: number
          metadata?: Json
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_type?: string
          source_id?: string
          title?: string
          content_chunk?: string
          chunk_index?: number
          metadata?: Json
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_knowledge: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          target_user_id: string
        }
        Returns: {
          id: string
          content_type: string
          title: string
          content: string
          similarity: number
        }[]
      }
      match_knowledge_chunks: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          target_user_id: string
          allowed_sources?: string[]
        }
        Returns: {
          id: string
          source_type: string
          source_id: string
          title: string
          content_chunk: string
          chunk_index: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
