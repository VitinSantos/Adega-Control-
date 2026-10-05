import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  return {
    plugins: [react()],
    // Somente variáveis públicas chegam ao navegador (bundle).
    // NUNCA incluir 'SUPABASE_' aqui: esse prefixo guarda service role,
    // secret key e JWT secret, que não podem ser expostos ao frontend.
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  }
})
