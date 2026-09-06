import { createClient } from '@supabase/supabase-js';

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_ANON_KEY;

// O preview deve continuar renderizando mesmo durante uma inicialização de
// ambiente; o AppContext exibirá a falha de conexão sem derrubar toda a SPA.
const clientUrl = supabaseUrl || 'https://missing-supabase.invalid';
const clientKey = supabaseKey || 'missing-supabase-key';

// Este cliente usa apenas a chave PÚBLICA (publishable/anon). Nunca coloque
// a SUPABASE_SECRET_KEY aqui -- ela nunca deve rodar no navegador.
export const supabase = createClient(clientUrl, clientKey);
