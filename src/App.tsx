import { useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pdv } from './pages/Pdv';
import { Estoque } from './pages/Estoque';
import { Receitas } from './pages/Receitas';
import { Relatorios } from './pages/Relatorios';

export default function App() {
  const [paginaAtual, setPaginaAtual] = useState<string>('dashboard');

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} />
      <main className="flex-1 overflow-y-auto">
        {renderizarPagina()}
      </main>
    </div>
  );
}