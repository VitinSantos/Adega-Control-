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
  // O preview pode executar o Vite em modo `production`, enquanto as
  // variáveis gerenciadas pelo v0 ficam no arquivo de desenvolvimento.
  // Mesclar os dois modos evita que o cliente seja compilado com valores vazios.
  const modeEnv = loadEnv(mode, process.cwd(), '')
  const developmentEnv = mode === 'development' ? {} : loadEnv('development', process.cwd(), '')
  const fileEnv = { ...developmentEnv, ...modeEnv }
  const defineEnv = Object.fromEntries(
    envNames.map((name) => [
      `import.meta.env.${name}`,
      JSON.stringify(fileEnv[name] || process.env[name] || ''),
    ]),
  )

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
    define: defineEnv,
  }
})
