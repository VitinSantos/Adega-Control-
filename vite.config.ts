import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
    // Mantém as variáveis injetadas pelo Vite intactas; definir cada chave
    // manualmente com string vazia sobrescreve o ambiente do preview.
  }
})
