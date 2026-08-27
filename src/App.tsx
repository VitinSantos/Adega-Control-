import { useState } from 'react';
import { Menu } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pdv } from './pages/Pdv';
import { Estoque } from './pages/Estoque';
import { Receitas } from './pages/Receitas';
import { Relatorios } from './pages/Relatorios';
import { useApp } from './context/AppContext';

export default function App() {
  const [paginaAtual, setPaginaAtual] = useState<string>('dashboard');
  const [menuAberto, setMenuAberto] = useState<boolean>(false);
  const { carregando, erroConexao, sessao, sair } = useApp();

  if (!sessao) {
    return (
      <ThemeProvider>
        <Login />
      </ThemeProvider>
    );
  }

  if (carregando) {
    return (
      <ThemeProvider>
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Carregando dados do banco...</p>
        </div>
      </ThemeProvider>
    );
  }

  if (erroConexao) {
    return (
      <ThemeProvider>
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
          <div className="max-w-md bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 rounded p-6 shadow-sm text-center">
            <p className="text-red-600 dark:text-red-400 font-bold mb-2">Não foi possível conectar ao banco de dados</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{erroConexao}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">Verifique sua conexão com a internet e as variáveis de ambiente do Supabase (.env).</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-200">

        {menuAberto && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMenuAberto(false)}
          />
        )}

        <div className={`fixed inset-y-0 left-0 transform ${menuAberto ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out z-50 md:flex`}>
          <Sidebar
            currentTab={paginaAtual}
            setCurrentTab={(pagina) => {
              setPaginaAtual(pagina);
              setMenuAberto(false);
            }}
            onLogout={() => { void sair(); }}
          />
        </div>

        <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
          <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shrink-0 transition-colors">
            <div className="font-bold text-xl text-gray-800 dark:text-white">
              Adega<span className="text-emerald-500">Control</span>
            </div>
            <button
              onClick={() => setMenuAberto(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 focus:outline-none p-1"
            >
              <Menu size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            {(() => {
              switch (paginaAtual) {
                case 'dashboard': return <Dashboard />;
                case 'pdv': return <Pdv />;
                case 'estoque': return <Estoque />;
                case 'receitas': return <Receitas />;
                case 'relatorios': return <Relatorios />;
                default: return <Dashboard />;
              }
            })()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
