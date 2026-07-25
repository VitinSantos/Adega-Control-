import { useState } from 'react';
import { Wine, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples (você pode integrar com backend ou Firebase futuramente)
    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    // Limpa erro e dispara a função que libera o acesso no App.tsx
    setErro('');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
        
        {/* Detalhe visual superior em destaque */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl text-emerald-600 mb-4 shadow-sm">
            <Wine size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Adega<span className="text-emerald-500">Control</span></h1>
          <p className="text-sm text-gray-500 mt-1">Faça login para acessar o painel operacional</p>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </span>
              <input 
                type="email"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="adm@adegacontrol.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </span>
              <input 
                type="password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              Lembrar de mim
            </label>
            <a href="#" className="text-emerald-600 hover:underline font-medium">Esqueceu a senha?</a>
          </div>

          <button 
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
          >
            Entrar no Sistema <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          AdegaControl • Gestão Inteligente
        </div>
      </div>
    </div>
  );
}