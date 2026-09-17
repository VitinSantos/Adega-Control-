import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL não configurada.');
}

if (!supabaseKey) {
  throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY não configurada.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Mantém a sessão no navegador e a renova automaticamente após recarregar.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
