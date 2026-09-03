import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const envNames = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
] as const

export default defineConfig(({ mode }) => {
  // loadEnv também lê os arquivos .env do projeto. O fallback em
  // process.env cobre as variáveis injetadas pelo ambiente do preview.
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const defineEnv = Object.fromEntries(
    envNames.map((name) => [
      `import.meta.env.${name}`,
      JSON.stringify(fileEnv[name] ?? process.env[name] ?? ''),
    ]),
  )

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
    define: defineEnv,
  }
})
