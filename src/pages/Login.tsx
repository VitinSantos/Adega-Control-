import React, { useState } from 'react';
import {
  Wine,
  ShieldCheck,
  ShoppingBag,
  BarChart2,
  Moon,
  Sun,
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const [modoCadastro, setModoCadastro] = useState(false);

  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErro(null);
    setMensagem(null);
    setEntrando(true);

    const emailFormatado = email.trim().toLowerCase();

    try {
      /*
       * ============================
       * CADASTRO
       * ============================
       */

      if (modoCadastro) {
        if (!nome.trim()) {
          setErro('Digite seu nome.');
          setEntrando(false);
          return;
        }

        if (!emailFormatado) {
          setErro('Digite seu e-mail.');
          setEntrando(false);
          return;
        }

        if (!password) {
          setErro('Digite sua senha.');
          setEntrando(false);
          return;
        }

        if (password.length < 6) {
          setErro('A senha precisa ter pelo menos 6 caracteres.');
          setEntrando(false);
          return;
        }

        console.log('Iniciando cadastro:', emailFormatado);

        const { data, error } = await supabase.auth.signUp({
          email: emailFormatado,
          password,
          options: {
            data: {
              nome: nome.trim(),
            },
          },
        });

        setEntrando(false);

        if (error) {
          console.error('Erro no cadastro:', error);

          const mensagemErro = error.message.toLowerCase();

          if (
            mensagemErro.includes('already registered') ||
            mensagemErro.includes('user already') ||
            mensagemErro.includes('already exists')
          ) {
            setErro(
              'Este e-mail já possui uma conta. Use "Já tenho uma conta" para entrar.'
            );
          } else if (mensagemErro.includes('password')) {
            setErro('A senha precisa ter pelo menos 6 caracteres.');
          } else if (mensagemErro.includes('email')) {
            setErro(error.message);
          } else {
            setErro(error.message);
          }

          return;
        }

        console.log('Cadastro realizado:', data);

        /*
         * Se o Supabase retornar uma sessão,
         * o usuário já está autenticado.
         */

        if (data.session) {
          onLoginSuccess();
          return;
        }

        /*
         * Caso a confirmação de e-mail esteja ativada,
         * o usuário precisa confirmar o e-mail antes de entrar.
         */

        setMensagem(
          'Conta criada com sucesso! Confirme seu e-mail antes de entrar.'
        );

        setModoCadastro(false);
        setPassword('');

        return;
      }

      /*
       * ============================
       * LOGIN
       * ============================
       */

      if (!emailFormatado) {
        setErro('Digite seu e-mail.');
        setEntrando(false);
        return;
      }

      if (!password) {
        setErro('Digite sua senha.');
        setEntrando(false);
        return;
      }

      console.log('Tentando realizar login...');
      console.log('E-mail:', emailFormatado);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailFormatado,
        password,
      });

      setEntrando(false);

      /*
       * Se houver erro, mostramos o erro REAL
       * retornado pelo Supabase.
       */

      if (error) {
        console.error('Erro no login:', error);

        setErro(error.message);

        return;
      }

      /*
       * Login realizado com sucesso.
       */

      console.log('Login realizado com sucesso:', data);

      onLoginSuccess();
    } catch (error) {
      /*
       * Trata erros inesperados,
       * incluindo problemas de conexão.
       */

      setEntrando(false);

      console.error('Erro inesperado:', error);

      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          'Não foi possível conectar ao servidor. Verifique sua conexão e as configurações do Supabase.'
        );
      }
    }
  };

  /*
   * Alterna entre Login e Cadastro
   */

  const alternarModo = () => {
    setModoCadastro((atual) => !atual);

    setErro(null);
    setMensagem(null);

    setPassword('');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 relative">

      {/* ============================
          BOTÃO DE TEMA
      ============================ */}

      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition z-20"
        title="Alternar Modo Escuro"
      >
        {theme === 'dark' ? (
          <Sun size={20} />
        ) : (
          <Moon size={20} />
        )}
      </button>

      {/* ============================
          LADO ESQUERDO
      ============================ */}

      <div className="hidden lg:flex lg:w-1/2 bg-emerald-900 dark:bg-emerald-950 text-white p-12 flex-col justify-between relative overflow-hidden">

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative z-10">

          {/* LOGO */}

          <div className="flex items-center gap-3 mb-16">

            <div className="p-2.5 bg-emerald-500/20 rounded-2xl backdrop-blur-sm border border-emerald-500/30">
              <Wine className="w-8 h-8 text-emerald-400" />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              Adega
              <span className="text-emerald-400">
                Control
              </span>
            </span>

          </div>

          {/* TEXTO */}

          <div className="space-y-6 max-w-md">

            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Gestão inteligente para o seu negócio.
            </h1>

            <p className="text-emerald-200 text-sm leading-relaxed">
              Controle de estoque de ponta a ponta, PDV rápido para vendas no balcão,
              gestão de receitas e relatórios financeiros detalhados em um único lugar.
            </p>

          </div>

        </div>

        {/* ============================
            CARDS
        ============================ */}

        <div className="grid grid-cols-3 gap-4 relative z-10 pt-8 border-t border-emerald-800/60">

          {/* PDV */}

          <div className="p-4 bg-emerald-800/40 rounded-2xl backdrop-blur-sm border border-emerald-700/50">

            <ShoppingBag className="w-6 h-6 text-emerald-400 mb-2" />

            <h3 className="text-xs font-bold">
              PDV Rápido
            </h3>

            <p className="text-[11px] text-emerald-300 mt-0.5">
              Agilidade no caixa
            </p>

          </div>

          {/* RELATÓRIOS */}

          <div className="p-4 bg-emerald-800/40 rounded-2xl backdrop-blur-sm border border-emerald-700/50">

            <BarChart2 className="w-6 h-6 text-emerald-400 mb-2" />

            <h3 className="text-xs font-bold">
              Relatórios
            </h3>

            <p className="text-[11px] text-emerald-300 mt-0.5">
              Visão de lucro total
            </p>

          </div>

          {/* SEGURANÇA */}

          <div className="p-4 bg-emerald-800/40 rounded-2xl backdrop-blur-sm border border-emerald-700/50">

            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />

            <h3 className="text-xs font-bold">
              Segurança
            </h3>

            <p className="text-[11px] text-emerald-300 mt-0.5">
              Controle confiável
            </p>

          </div>

        </div>

      </div>

      {/* ============================
          LADO DIREITO
      ============================ */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">

        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">

          {/* TÍTULO */}

          <div className="text-center">

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {modoCadastro
                ? 'Crie sua conta'
                : 'Acesse o painel'}
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">

              {modoCadastro
                ? 'Cadastre-se para começar a utilizar o AdegaControl'
                : 'Insira suas credenciais para gerenciar sua adega'}

            </p>

          </div>

          {/* ============================
              FORMULÁRIO
          ============================ */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* ERRO */}

            {erro && (
              <div
                className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
                role="alert"
              >

                <p className="text-sm text-red-600 dark:text-red-400 break-words">
                  {erro}
                </p>

              </div>
            )}

            {/* MENSAGEM */}

            {mensagem && (
              <div
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900"
                role="status"
              >

                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {mensagem}
                </p>

              </div>
            )}

            {/* ============================
                NOME
            ============================ */}

            {modoCadastro && (
              <div>

                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nome
                </label>

                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition"
                />

              </div>
            )}

            {/* ============================
                E-MAIL
            ============================ */}

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
                autoComplete="email"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition"
              />

            </div>

            {/* ============================
                SENHA
            ============================ */}

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
                autoComplete={
                  modoCadastro
                    ? 'new-password'
                    : 'current-password'
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition"
              />

            </div>

            {/* ============================
                BOTÃO
            ============================ */}

            <button
              type="submit"
              disabled={entrando}
              className="w-full py-3.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {entrando
                ? modoCadastro
                  ? 'Criando conta...'
                  : 'Entrando...'
                : modoCadastro
                  ? 'Criar minha conta'
                  : 'Entrar no Sistema'}

            </button>

          </form>

          {/* ============================
              ALTERNAR LOGIN / CADASTRO
          ============================ */}

          <button
            type="button"
            onClick={alternarModo}
            disabled={entrando}
            className="w-full text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {modoCadastro
              ? 'Já tenho uma conta'
              : 'Ainda não tenho uma conta'}

          </button>

          {/* ============================
              RODAPÉ
          ============================ */}

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