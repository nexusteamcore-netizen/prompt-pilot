import { createClient } from '@supabase/supabase-js';

// Load values from .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables! Site may not function correctly.');
}

// 1. Initialize Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// 2. Export Helper Types (Optional but helpful)
export type Database = {
  profiles: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    plan: 'free' | 'pro' | 'team';
    created_at: string;
  };
  prompt_history: {
    id: string;
    user_id: string;
    original_text: string;
    transformed_text: string;
    mode: string;
    created_at: string;
  };
};
