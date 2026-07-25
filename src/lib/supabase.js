import { createClient } from '@supabase/supabase-js'

// Anon key — safe for client side (RLS should be enabled in production)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
