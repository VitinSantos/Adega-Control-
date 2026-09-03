import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O Vercel injeta estas variáveis no processo do Vite. O envPrefix faz com
// que o próprio Vite as exponha no bundle, sem substituir valores por
// `undefined` durante a configuração do build.
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
})
