import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Let Vite inject the project environment variables at build time.
  // Custom `define` mappings can overwrite them with undefined in preview builds.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
})
