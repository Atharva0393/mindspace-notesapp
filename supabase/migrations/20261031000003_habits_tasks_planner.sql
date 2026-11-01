-- Migration: 20261031000003_habits_tasks_planner.sql
-- Description: Add enhancements to habits, habit_logs, tasks, goals, daily_plans, and time_blocks

-- 1. Enhance Habits Table
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Personal',
  ADD COLUMN IF NOT EXISTS schedule_days INT[] DEFAULT '{1,2,3,4,5,6,7}',
  ADD COLUMN IF NOT EXISTS is_paused BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_time TEXT,
  ADD COLUMN IF NOT EXISTS streak_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_streak INT NOT NULL DEFAULT 0;

-- 2. Enhance Habit Logs Table
ALTER TABLE public.habit_logs
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';

-- 3. Enhance Tasks Table
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS project TEXT,
  ADD COLUMN IF NOT EXISTS recurrence TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS due_time TEXT,
  ADD COLUMN IF NOT EXISTS linked_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 4. Enhance Goals Table
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS linked_note_ids UUID[] DEFAULT '{}';

-- 5. Enhance Daily Plans Table
ALTER TABLE public.daily_plans
  ADD COLUMN IF NOT EXISTS daily_reflection JSONB;

-- 6. Enhance Time Blocks Table
ALTER TABLE public.time_blocks
  ADD COLUMN IF NOT EXISTS block_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 7. Indices for Performance
CREATE INDEX IF NOT EXISTS idx_habits_user_paused ON public.habits(user_id, is_archived, is_paused);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_goal ON public.tasks(user_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON public.time_blocks(user_id, block_date);

