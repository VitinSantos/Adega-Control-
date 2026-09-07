import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  MessageCircle,
  Moon,
  Sun,
  X,
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout?: () => void;
}

export function Sidebar({
  currentTab,
  setCurrentTab,
  onLogout,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [showConfigModal, setShowConfigModal] =
    useState(false);

  const [nome, setNome] =
    useState('Colaborador');

  const [email, setEmail] =
    useState('');

  const [carregandoPerfil, setCarregandoPerfil] =
    useState(true);

  /*
   * =====================================================
   * CARREGAR USUÁRIO E PERFIL
   * =====================================================
   */

  const carregarPerfil = async () => {
    try {
      setCarregandoPerfil(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          'Erro ao buscar usuário:',
          userError
        );
      }

      if (!user) {
        setNome('Colaborador');
        setEmail('');
        return;
      }

      const emailUsuario = user.email || '';

      setEmail(emailUsuario);

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('nome, email')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          'Erro ao carregar perfil:',
          profileError
        );
      }

      const nomeUsuario =
        profile?.nome ||
        user.user_metadata?.nome ||
        emailUsuario.split('@')[0] ||
        'Colaborador';

      setNome(nomeUsuario);

      if (profile?.email) {
        setEmail(profile.email);
      }
    } catch (error) {
      console.error(
        'Erro ao carregar usuário:',
        error
      );
    } finally {
      setCarregandoPerfil(false);
    }
  };

  /*
   * =====================================================
   * AUTH LISTENER
   * =====================================================
   */

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void carregarPerfil();
    }, 0);

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED'
        ) {
          carregarPerfil();
        }

        if (event === 'SIGNED_OUT') {
          setNome('Colaborador');
          setEmail('');
        }
      }
    );

    return () => {
      window.clearTimeout(initialLoad);
      authListener.subscription.unsubscribe();
    };
  }, []);

  /*
   * =====================================================
   * PRIMEIRA LETRA DO E-MAIL
   * =====================================================
   */

  const inicialEmail =
    email.trim().charAt(0).toUpperCase() || '?';

  /*
   * =====================================================
   * MENU
   * =====================================================
   */

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'pdv',
      label: 'PDV (Vendas)',
      icon: ShoppingCart,
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: Package,
    },
    {
      id: 'receitas',
      label: 'Receitas',
      icon: BookOpen,
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: BarChart3,
    },
  ];

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const handleLogout = () => {
    setShowProfileMenu(false);
    setShowConfigModal(false);
    setShowProfileModal(false);

    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between h-screen sticky top-0 text-gray-900 dark:text-gray-100 z-30 transition-colors duration-200">

        {/* =====================================================
            MENU SUPERIOR
        ===================================================== */}

        <div>

          <div className="p-6 flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              Adega
              <span className="text-emerald-600">
                Control
              </span>
            </span>
          </div>

          <nav className="px-4 space-y-1.5">

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setCurrentTab(item.id)
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }
                  />

                  {item.label}
                </button>
              );
            })}

          </nav>
        </div>

        {/* =====================================================
            PERFIL
        ===================================================== */}

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 relative">

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() =>
                  setShowProfileMenu(false)
                }
              />

              <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50">

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {inicialEmail}
                  </div>

                  Meu Perfil
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                >
                  <LogOut size={16} />

                  Sair da Conta
                </button>

              </div>
            </>
          )}

          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100/80 dark:hover:bg-gray-700 p-2 rounded-2xl transition border border-gray-100 dark:border-gray-700">

            <button
              type="button"
              onClick={() =>
                setShowProfileMenu(
                  !showProfileMenu
                )
              }
              className="flex items-center gap-3 text-left flex-1 min-w-0"
            >

              {/* AVATAR */}

              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200 dark:border-emerald-500">
                {carregandoPerfil
                  ? '?'
                  : inicialEmail}
              </div>

              {/* DADOS */}

              <div className="min-w-0">

                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {carregandoPerfil
                    ? 'Carregando...'
                    : email || 'Sem e-mail'}
                </p>

                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  Colaborador
                </p>

              </div>

            </button>

            <button
              type="button"
              onClick={() =>
                setShowConfigModal(true)
              }
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition shadow-sm"
              title="Configurações"
            >
              <Settings size={18} />
            </button>

          </div>
        </div>
      </aside>

      {/* =====================================================
          MODAL DE PERFIL
      ===================================================== */}

      {showProfileModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() =>
              setShowProfileModal(false)
            }
          >

            <div
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700 relative space-y-6 text-gray-900 dark:text-white"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* CABEÇALHO */}

              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">

                <h3 className="text-xl font-bold">
                  Perfil do Colaborador
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setShowProfileModal(false)
                  }
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>

              </div>

              {/* AVATAR */}

              <div className="flex flex-col items-center space-y-4 py-2">

                <div className="w-28 h-28 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-5xl border-4 border-emerald-100 dark:border-emerald-900 shadow-md">
                  {inicialEmail}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Seu avatar utiliza a primeira letra do seu e-mail.
                </p>

              </div>

              {/* DADOS */}

              <div className="space-y-4">

                <div>

                  <label
                    htmlFor="perfil-nome"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nome
                  </label>

                  <input
                    id="perfil-nome"
                    type="text"
                    value={nome}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-300 cursor-not-allowed"
                  />

                </div>

                <div>

                  <label
                    htmlFor="perfil-email"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                  >
                    E-mail
                  </label>

                  <input
                    id="perfil-email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-300 cursor-not-allowed"
                  />

                  <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block">
                    Apenas o desenvolvedor pode alterar o e-mail.
                  </span>

                </div>

              </div>

              {/* BOTÃO */}

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">

                <button
                  type="button"
                  onClick={() =>
                    setShowProfileModal(false)
                  }
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Fechar
                </button>

              </div>

            </div>

          </div>,
          document.body
        )}

      {/* =====================================================
          MODAL CONFIGURAÇÕES
      ===================================================== */}

      {showConfigModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() =>
              setShowConfigModal(false)
            }
          >

            <div
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700 relative space-y-6 text-gray-900 dark:text-white"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* CABEÇALHO */}

              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">

                <h3 className="text-xl font-bold flex items-center gap-2.5">

                  <Settings
                    size={22}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                  Configurações do Sistema

                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setShowConfigModal(false)
                  }
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="space-y-4 py-2">

                {/* TEMA */}

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">

                  <div className="flex items-center gap-3.5">

                    <div className="p-2.5 bg-white dark:bg-gray-700 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">

                      {theme === 'dark' ? (
                        <Sun size={20} />
                      ) : (
                        <Moon size={20} />
                      )}

                    </div>

                    <div>

                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Modo Claro / Escuro
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">

                        Atual:{' '}

                        <span className="font-semibold capitalize">

                          {theme === 'dark'
                            ? 'Escuro 🌙'
                            : 'Claro ☀️'}

                        </span>

                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900 transition"
                  >
                    Alternar
                  </button>

                </div>

                {/* SUPORTE */}

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">

                  <div className="flex items-center gap-3.5">

                    <div className="p-2.5 bg-white dark:bg-gray-700 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <MessageCircle size={20} />
                    </div>

                    <div>

                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Suporte Técnico
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        WhatsApp: 11 943906039
                      </p>

                    </div>

                  </div>

                  <a
                    href="https://wa.me/5511943906039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
                  >
                    Chamar
                  </a>

                </div>

                {/* SAIR */}

                <div className="pt-2">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 transition border border-red-100 dark:border-red-900/50 shadow-sm"
                  >
                    <LogOut size={18} />

                    Sair da Conta
                  </button>

                </div>

              </div>

              {/* FECHAR */}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">

                <button
                  type="button"
                  onClick={() =>
                    setShowConfigModal(false)
                  }
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Fechar
                </button>

              </div>

            </div>

          </div>,
          document.body
        )}
    </>
  );
}
