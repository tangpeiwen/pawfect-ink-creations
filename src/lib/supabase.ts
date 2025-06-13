import { createClient } from '@supabase/supabase-js'

const databaseUrl = import.meta.env.VITE_SUPABASE_URL // 或改为VITE_DATABASE_URL
const databaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY // 或改为VITE_DATABASE_ANON_KEY

if (!databaseUrl || !databaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(databaseUrl, databaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 