import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Client-side Supabase client singleton (for use in React components, client components)
// Uses NEXT_PUBLIC variables and respects RLS policies
let clientSupabaseInstance: SupabaseClient<Database> | null = null

export function createClientSupabase(): SupabaseClient<Database> {
  // Return existing instance if already created (singleton pattern)
  if (clientSupabaseInstance) {
    return clientSupabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
  }

  clientSupabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return clientSupabaseInstance
}

// Server-side Supabase client (for use in API routes, server components, server actions)
// Uses service role key and bypasses RLS policies for admin operations
// REQUIRED for: Stripe webhooks (to update order status), admin operations, server-side writes that bypass RLS
// For public read operations, use createPublicSupabase() instead which uses the anon key
// Note: Creates a new instance each time (no singleton) for server-side usage
// Usage in webhooks: import { createServerSupabase } from '@/lib/supabase' then const supabase = createServerSupabase()
export function createServerSupabase(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL is required')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for admin operations. ' +
      'If you only need to read public data, use createPublicSupabase() instead. ' +
      'Service role key can be found in Supabase Dashboard → Settings → API → service_role key (secret)'
    )
  }

  // Check for placeholder values
  if (
    supabaseServiceRoleKey.includes('your_supabase') ||
    supabaseServiceRoleKey.includes('placeholder')
  ) {
    throw new Error('Please replace the placeholder SUPABASE_SERVICE_ROLE_KEY in .env.local with your actual service role key')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Server-side Supabase client for public reads (no service role required)
// Use this for reading public data in server components
export function createPublicSupabase(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if variables are missing or still have placeholder values
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
  }

  if (
    supabaseUrl.includes('your_supabase') ||
    supabaseUrl.includes('placeholder') ||
    supabaseAnonKey.includes('your_supabase') ||
    supabaseAnonKey.includes('placeholder')
  ) {
    throw new Error('Please replace the placeholder values in .env.local with your actual Supabase credentials')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export functions only - create instances as needed
// For client components: import { createClientSupabase } from '@/lib/supabase' then const supabase = createClientSupabase()
// For server-side public reads: import { createPublicSupabase } from '@/lib/supabase'
// For server-side admin: import { createServerSupabase } from '@/lib/supabase'
