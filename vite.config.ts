import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Keep Vite's native environment loading intact. The project injects the
  // VITE_SUPABASE_* variables before starting the preview server.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
})
