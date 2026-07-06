import { LayoutDashboard, ShoppingCart, Package, FlaskConical, BarChart3 } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pdv', label: 'PDV (Vendas)', icon: ShoppingCart },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'receitas', label: 'Receitas', icon: FlaskConical },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
];

export function Sidebar({ paginaAtual, setPaginaAtual }: { paginaAtual: string, setPaginaAtual: (p: string) => void }) {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 font-bold text-xl">Adega<span className="text-emerald-500">Control</span></div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const ativo = paginaAtual === item.id;
          return (
            <button key={item.id} onClick={() => setPaginaAtual(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${ativo ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Icon size={20} /> {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}