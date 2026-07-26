import { useState } from 'react';
import { Wine, Lock, Mail, ArrowRight, ShieldCheck, TrendingUp, Package } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    setErro('');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen w-full flex bg-white text-gray-900">
      
      {/* Lado Esquerdo: Branding e Apresentação (Oculto no mobile, visível em telas grandes) */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-50 p-12 flex-col justify-between border-r border-emerald-100 relative overflow-hidden">
        {/* Detalhe estético de fundo */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Wine size={22} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Adega<span className="text-emerald-600">Control</span></span>
          </div>
        </div>

        <div className="my-auto space-y-6 max-w-lg">
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-emerald-200/60 text-emerald-800 px-3 py-1 rounded-full">
            Sistema de Gestão Exclusivo
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Controle total da sua adega na palma da sua mão.
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Gerencie estoque, realize vendas rápidas no PDV, acompanhe receitas e supervise o operacional sem complicações.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-sm">
              <Package size={20} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-gray-700">Controle de Estoque</span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-sm">
              <TrendingUp size={20} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-gray-700">PDV & Vendas</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Ambiente seguro e restrito para colaboradores e gestores.</span>
        </div>
      </div>

      {/* Lado Direito: Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo visível apenas no mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <Wine size={20} />
            </div>
            <span className="font-bold text-lg text-gray-900">Adega<span className="text-emerald-600">Control</span></span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bem-vindo de volta!</h2>
            <p className="text-sm text-gray-500 mt-1">Insira suas credenciais para acessar o painel.</p>
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-medium">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">E-mail corporativo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </span>
                <input 
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="exemplo@adegacontrol.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">Senha</label>
                <a href="#" className="text-xs text-emerald-600 hover:underline font-medium">Esqueceu?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </span>
                <input 
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 active:scale-[0.99]"
            >
              Entrar no Sistema <ArrowRight size={18} />
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            AdegaControl • Todos os direitos reservados © 2024
          </div>
        </div>
      </div>

    </div>
  );
}