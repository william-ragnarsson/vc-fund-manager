import { createClient } from '@supabase/supabase-js';
import type { Database } from '../data/database.types';

// The URL and publishable key are public by design: row level security decides what they can read and write.
// VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY point the app at another project, such as a local `supabase start`.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://qjxqbenmtlkmjknshywj.supabase.co';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_FqVJAaKkF_yeVrV58guguQ_QBEo1C7_';

export const supabase = createClient<Database>(url, key, {
  // No sign-in yet, and the hash routes must not be read as auth callbacks.
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
