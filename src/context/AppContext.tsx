import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [produtos, setProdutos] = useState(() => {
    try {
      const saved = localStorage.getItem('adega_produtos');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [vendas, setVendas] = useState(() => {
    try {
      const saved = localStorage.getItem('adega_vendas');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [receitas, setReceitas] = useState(() => {
    try {
      const saved = localStorage.getItem('adega_receitas');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Estado global de notificações (Toasts)
  const [notificacoes, setNotificacoes] = useState<any[]>([]);

  const adicionarNotificacao = (mensagem: string, tipo: 'aviso' | 'erro' = 'aviso') => {
    const id = Date.now() + Math.random();
    setNotificacoes(prev => [...prev, { id, mensagem, tipo }]);
    // Fecha automaticamente após 6 segundos caso o usuário não clique no X
    setTimeout(() => {
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  useEffect(() => {
    localStorage.setItem('adega_produtos', JSON.stringify(produtos));
    localStorage.setItem('adega_vendas', JSON.stringify(vendas));
    localStorage.setItem('adega_receitas', JSON.stringify(receitas));
  }, [produtos, vendas, receitas]);

  const darBaixa = (nome: string, tipo: string, quantidade: number) => {
    // 1. Verifica as regras de estoque e prepara a notificação ANTES de atualizar o estado
    const p = produtos.find((x: any) => x.nome === nome);
    if (p) {
      let desconto = quantidade;
      if (tipo === 'ML' && p.mlPorGarrafa > 0) {
        desconto = quantidade / p.mlPorGarrafa;
      }
      const estoqueFinal = p.qtd - desconto;
      const garrafasFechadas = Math.trunc(estoqueFinal); // Pega a unidade inteira sem os MLs

      if (estoqueFinal <= 0) {
        adicionarNotificacao(`Estoque INDISPONÍVEL/NEGATIVO para: ${p.nome} (${garrafasFechadas} un)`, 'erro');
      } else if (garrafasFechadas <= p.alertaMinimo) {
        adicionarNotificacao(`Estoque crítico para: ${p.nome} (Restam apenas ${garrafasFechadas} un)`, 'aviso');
      }
    }

    // 2. Atualiza o estoque permitindo valores negativos
    setProdutos((prev: any[]) => prev.map(p => {
      if (p.nome === nome) {
        let desconto = quantidade;
        if (tipo === 'ML' && p.mlPorGarrafa > 0) {
          desconto = quantidade / p.mlPorGarrafa;
        }
        // Removido o Math.max para permitir que o estoque fique negativo (-1, -2, etc)
        return { ...p, qtd: p.qtd - desconto };
      }
      return p;
    }));
  };

  return (
    <AppContext.Provider value={{ produtos, setProdutos, vendas, setVendas, receitas, setReceitas, darBaixa, notificacoes, setNotificacoes }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);