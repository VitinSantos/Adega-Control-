/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        adega: {
          bg: "#F9FAFB",       // Fundo cinza bem claro
          card: "#FFFFFF",     // Fundo branco pros blocos
          text: "#111827",     // Texto escuro (quase preto)
          muted: "#6B7280",    // Textos secundários
          border: "#E5E7EB",   // Linhas de separação
          success: "#10B981",  // Verde para lucros/ações
          danger: "#EF4444",   // Vermelho para alertas
          primary: "#111827",  // Botões principais pretos
        }
      }
    },
  },
  plugins: [],
}