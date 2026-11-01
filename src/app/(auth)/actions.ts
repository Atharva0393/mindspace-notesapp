'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export interface AuthActionResult {
  error?: string
  success?: boolean
  message?: string
}

export async function login(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please provide both email and password.' }
  }

  if (!isSupabaseConfigured()) {
    return {
      error: 'Supabase credentials are not configured yet. Please add them to .env.local to log in.',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/app')
}

export async function signup(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password) {
    return { error: 'Please provide both email and password.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  if (!isSupabaseConfigured()) {
    return {
      error: 'Supabase credentials are not configured yet. Please add them to .env.local to sign up.',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    message: 'Check your email inbox for a confirmation link to activate your account.',
  }
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  revalidatePath('/', 'layout')
  redirect('/login')
}

