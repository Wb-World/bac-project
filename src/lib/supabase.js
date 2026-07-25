import { createClient } from '@supabase/supabase-js'

// Anon key — safe for client side (RLS should be enabled in production)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ2FxZnh5bGRxcG9nZWl5dGRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk2ODAwMywiZXhwIjoyMTAwNTQ0MDAzfQ.YYD9VVBbH5yvS7znplkkW1bHCEhj1D9eAkIZASEPkSQ.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ2FxZnh5bGRxcG9nZWl5dGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjgwMDMsImV4cCI6MjEwMDU0NDAwM30.qg8_B_e0lqvjNBrJqb1HDDpWfwERpPsblaF77v_peEc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
