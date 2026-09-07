import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const value = (key: string) => process.env[key] || env[key] || ''

  const supabaseUrl = value('VITE_SUPABASE_URL') || value('NEXT_PUBLIC_SUPABASE_URL') || value('SUPABASE_URL')
  const supabaseKey = value('VITE_SUPABASE_PUBLISHABLE_KEY') || value('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || value('SUPABASE_PUBLISHABLE_KEY') || value('NEXT_PUBLIC_SUPABASE_ANON_KEY') || value('SUPABASE_ANON_KEY')

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
    },
  }
})
