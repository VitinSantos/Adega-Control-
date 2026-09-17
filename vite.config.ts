import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const env = { ...fileEnv, ...process.env }

  const firstConfigured = (...values: Array<string | undefined>) =>
    values.find((value) => typeof value === 'string' && value.trim().length > 0)

  const supabaseUrl = firstConfigured(
    fileEnv.VITE_SUPABASE_URL,
    fileEnv.NEXT_PUBLIC_SUPABASE_URL,
    fileEnv.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  )
  const supabaseKey = firstConfigured(
    fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
    fileEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    fileEnv.SUPABASE_PUBLISHABLE_KEY,
    fileEnv.SUPABASE_ANON_KEY,
    fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
    },
  }
})
