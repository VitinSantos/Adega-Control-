import React, { useState } from 'react';
import { Wine, ShieldCheck, ShoppingBag, BarChart2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 relative">
      
      {/* Botão para mudar o tema na própria tela de login */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition z-20"
        title="Alternar Modo Escuro"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Lado Esquerdo - Apresentação Institucional */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-900 dark:bg-emerald-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl backdrop-blur-sm border border-emerald-500/30">
              <Wine className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Adega<span className="text-emerald-400">Control</span>
            </span>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Gestão inteligente para o seu negócio.
            </h1>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Controle de estoque de ponta a ponta, PDV rápido para vendas no balcão, gestão de receitas e relatórios financeiros detalhados em um único lugar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 relative z-10 pt-8 border-t border-emerald-800/60">
          <div className="p-4 bg-emerald-800/40 rounded-2xl backdrop-blur-sm border border-emerald-700/50">
            <ShoppingBag className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold">PDV Rápido</h3>
            <p className="text-[11px] text-emerald-300 mt-0.5">Agilidade no caixa</p>
          </div>
          <div className="p-4 bg-emerald-800/40 rounded-2xl backdrop-blur-sm border border-emerald-700/50">
            <BarChart2 className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold">Relatórios</h3>
            <p className="text-[11px] text-emerald-300 mt-0.5">Visão de lucro total</p>
          </div>
          <div className="p-4 bg-emerald-800/40 rounded-2xl backdrop-blur-sm border border-emerald-700/50">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold">Segurança</h3>
            <p className="text-[11px] text-emerald-300 mt-0.5">Controle confiável</p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acesse o painel</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Insira suas credenciais para gerenciar sua adega
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@adegacontrol.com"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-md shadow-emerald-600/20"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              © 2026 AdegaControl SaaS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}