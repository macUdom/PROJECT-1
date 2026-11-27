import { createClient } from '@supabase/supabase-js'
import env from './env.js'

// Client that acts as an unauthenticated visitor — RLS still applies.
export const supabaseAnon = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: { persistSession: false },
})

// Client with the service role — bypasses RLS. SERVER ONLY. Never expose the
// service role key to the browser; it can read and write every row.
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: { persistSession: false },
})

export default { supabaseAnon, supabaseAdmin }
