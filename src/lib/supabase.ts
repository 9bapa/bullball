import { createClient } from '@supabase/supabase-js'

export const supabase:any = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.warn('Supabase client not initialized. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return null
  }
  return createClient(url, anonKey)
})();

// Service role client for server-side operations (cron jobs, admin functions)
export const supabaseService:any = (() => {
  // Check if we're on the server side
  const isServer = typeof window === 'undefined'
  
  if (!isServer) {
    // Client-side - don't use service role key for security
    console.warn('supabaseService should only be used server-side')
    return null
  }
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    console.warn('Supabase service role client not initialized. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return null
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})();


