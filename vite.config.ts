import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// O Vercel injeta as variáveis do Supabase com prefixos diferentes
// dependendo do ambiente. Expomos ambas as convenções ao bundle do Vite.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // loadEnv lê arquivos .env, enquanto as variáveis do projeto Vercel
  // chegam em process.env durante o build/preview.
  const runtimeEnv = { ...env, ...process.env }
  const supabaseUrl =
    runtimeEnv.VITE_SUPABASE_URL ||
    runtimeEnv.NEXT_PUBLIC_SUPABASE_URL ||
    runtimeEnv.SUPABASE_URL
  const supabaseKey =
    runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
    runtimeEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    runtimeEnv.VITE_SUPABASE_ANON_KEY ||
    runtimeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    runtimeEnv.SUPABASE_PUBLISHABLE_KEY ||
    runtimeEnv.SUPABASE_ANON_KEY

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
    },
  }
})
