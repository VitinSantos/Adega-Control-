import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LayoutDashboard, ShoppingCart, Package, BookOpen, BarChart3, Settings, LogOut, MessageCircle, Moon, Camera, X, AlertTriangle } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentTab, setCurrentTab, onLogout }: SidebarProps) {
  // Estados de controle dos Modais e Menus
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  // Estados de dados com persistência no localStorage
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return localStorage.getItem('adegacontrol_avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  });
  const [email] = useState('colaborador@adegacontrol.com');
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Validação ao tentar fechar modais com alterações não salvas
  const handleTryClose = (closeAction: () => void) => {
    if (isDirty) {
      setShowUnsavedAlert(true);
      setPendingAction(() => closeAction);
    } else {
      closeAction();
    }
  };

  const confirmDiscard = () => {
    setIsDirty(false);
    setShowUnsavedAlert(false);
    setAvatarUrl(localStorage.getItem('adegacontrol_avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    if (pendingAction) pendingAction();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatarUrl(uploadEvent.target.result as string);
          setIsDirty(true);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveProfileChanges = () => {
    localStorage.setItem('adegacontrol_avatar', avatarUrl);
    setIsDirty(false);
    setShowProfileModal(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pdv', label: 'PDV (Vendas)', icon: ShoppingCart },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'receitas', label: 'Receitas', icon: BookOpen },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 text-gray-900 z-30">
        
        {/* Topo / Logo e Navegação */}
        <div>
          <div className="p-6 flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Adega<span className="text-emerald-600">Control</span>
            </span>
          </div>

          <nav className="px-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé Estilo Gemini */}
        <div className="p-4 border-t border-gray-100 relative">
          
          {/* Menu flutuante do perfil com Backdrop para fechar ao clicar fora */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setShowProfileMenu(false)} 
              />
              <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                >
                  <Camera size={16} className="text-emerald-600" />
                  Alterar Imagem / Perfil
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  <LogOut size={16} />
                  Sair da Conta
                </button>
              </div>
            </>
          )}

          <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100/80 p-2 rounded-2xl transition border border-gray-100">
            {/* Foto e Nome */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 text-left flex-1 min-w-0"
            >
              <img
                src={avatarUrl}
                alt="Colaborador"
                className="w-9 h-9 rounded-full object-cover border border-emerald-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">Victor Santos</p>
                <p className="text-[10px] text-gray-500 truncate">Colaborador</p>
              </div>
            </button>

            {/* Botão de Configurações */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-white rounded-xl transition shadow-sm"
              title="Configurações"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* 1. Modal de Perfil / Alterar Imagem (Via Portal para o Body) */}
      {showProfileModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => handleTryClose(() => setShowProfileModal(false))}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Perfil do Colaborador</h3>
              <button 
                onClick={() => handleTryClose(() => setShowProfileModal(false))}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4 py-2">
              <div className="relative group">
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-28 h-28 rounded-full object-cover border-4 border-emerald-100 shadow-md"
                />
                <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-semibold">
                  <Camera size={22} className="mb-1" />
                  Alterar foto
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-500">Passe o mouse sobre a foto para alterar</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail corporativo</label>
                <input 
                  type="email" 
                  value={email} 
                  disabled 
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-amber-600 mt-1 block">Apenas o desenvolvedor pode alterar o e-mail.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleTryClose(() => setShowProfileModal(false))}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={saveProfileChanges}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. Modal de Configurações centralizado na tela (Via Portal para o Body) */}
      {showConfigModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => handleTryClose(() => setShowConfigModal(false))}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-100 relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                <Settings size={22} className="text-emerald-600" /> Configurações do Sistema
              </h3>
              <button 
                onClick={() => handleTryClose(() => setShowConfigModal(false))}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 py-2">
              {/* Botão de mudança de tema */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-white rounded-xl text-emerald-600 shadow-sm">
                    <Moon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Modo Claro / Escuro</p>
                    <p className="text-xs text-gray-500">Alternar tema visual da interface</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDirty(true)}
                  className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-200 transition"
                >
                  Alternar
                </button>
              </div>

              {/* Suporte WhatsApp */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-white rounded-xl text-emerald-600 shadow-sm">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Suporte Técnico</p>
                    <p className="text-xs text-gray-500">WhatsApp: 11 943906039</p>
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

              {/* Botão Sair */}
              <div className="pt-2">
                <button 
                  onClick={() => {
                    setShowConfigModal(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition border border-red-100 shadow-sm"
                >
                  <LogOut size={18} /> Sair da Conta
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleTryClose(() => setShowConfigModal(false))}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsDirty(false);
                  setShowConfigModal(false);
                }}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Modal de Confirmação de Saída sem Salvar (Via Portal para o Body) */}
      {showUnsavedAlert && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-base font-bold text-gray-900">Deseja realmente sair sem salvar?</h4>
            <p className="text-xs text-gray-500">Existem alterações pendentes que serão perdidas se você fechar agora.</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowUnsavedAlert(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
              >
                Continuar editando
              </button>
              <button
                onClick={confirmDiscard}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition shadow-md shadow-red-600/20"
              >
                Sair sem salvar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}