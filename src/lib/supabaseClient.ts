import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não encontradas. Verifique se o arquivo .env existe na raiz do projeto com VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
  );
}

// Este cliente usa apenas a chave PÚBLICA (publishable/anon). Nunca coloque
// a SUPABASE_SECRET_KEY aqui -- ela nunca deve rodar no navegador.
export const supabase = createClient(supabaseUrl, supabaseKey);
