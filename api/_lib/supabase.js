// api/_lib/supabase.js — server-side Supabase client (service role bypasses RLS)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.SUPABASE_URL             || 'https://opgaqfxyldqpogeiytdq.supabase.co'
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ2FxZnh5bGRxcG9nZWl5dGRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2ODAwMywiZXhwIjoyMTAwNTQ0MDAzfQ.YYD9VVBbH5yvS7znplkkW1bHCEhj1D9eAkIZASEPkSQ'

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})
