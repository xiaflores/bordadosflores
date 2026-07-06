import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((_event, session) => {
    const token = session?.access_token || '';
    const maxAge = session ? 7 * 24 * 60 * 60 : 0; // 7 days or delete
    document.cookie = `sb-access-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
  });
}
