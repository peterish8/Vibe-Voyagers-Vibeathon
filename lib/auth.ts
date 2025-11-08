'use client'

import { createClient } from '@/lib/supabase/client'

export async function signInWithGoogle() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/app`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      // Request additional scopes to get user profile data
      scopes: 'openid email profile',
    },
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return user
}

