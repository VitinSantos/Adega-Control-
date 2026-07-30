import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pdv } from './pages/Pdv';
import { Estoque } from './pages/Estoque';
import { Receitas } from './pages/Receitas';
import { Relatorios } from './pages/Relatorios';
import { useApp } from './context/AppContext';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [paginaAtual, setPaginaAtual] = useState<string>('dashboard');
  const [menuAberto, setMenuAberto] = useState<boolean>(false);
  const { carregando, erroConexao } = useApp();

  // 1. Se não estiver logado, exibe a tela de Login
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // 2. Enquanto os dados do banco ainda não chegaram, mostra um carregando
  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Carregando dados do banco...</p>
      </div>
    );
  }

  // 3. Se a conexão com o banco falhou, avisa em vez de mostrar telas quebradas
  if (erroConexao) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md bg-white border border-red-200 rounded p-6 shadow-sm text-center">
          <p className="text-red-600 font-bold mb-2">Não foi possível conectar ao banco de dados</p>
          <p className="text-gray-500 text-sm">{erroConexao}</p>
          <p className="text-gray-400 text-xs mt-4">Verifique sua conexão com a internet e as variáveis de ambiente do Supabase (.env).</p>
        </div>
      </div>
    );
  }

  // 4. Se estiver logado e os dados carregaram, exibe o painel do sistema
  const renderizarPagina = () => {
    switch (paginaAtual) {
      case 'dashboard': return <Dashboard />;
      case 'pdv': return <Pdv />;
      case 'estoque': return <Estoque />;
      case 'receitas': return <Receitas />;
      case 'relatorios': return <Relatorios />;
      default: return <Dashboard />;
    }
  };

  const mudarPagina = (pagina: string) => {
    setPaginaAtual(pagina);
    setMenuAberto(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {menuAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 transform ${menuAberto ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out z-50 md:flex`}>
        <Sidebar
          currentTab={paginaAtual}
          setCurrentTab={mudarPagina}
          onLogout={handleLogout}
        />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 shrink-0">
          <div className="font-bold text-xl text-gray-800">Adega<span className="text-emerald-500">Control</span></div>
          <button
            onClick={() => setMenuAberto(true)}
            className="text-gray-600 hover:text-emerald-600 focus:outline-none p-1"
          >
            <Menu size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {renderizarPagina()}
        </div>
      </main>
    </div>
  );
}
