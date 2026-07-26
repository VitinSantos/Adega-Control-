import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Produto, Venda, Receita, Notificacao, TipoNotificacao } from '../types';
import { gerarId } from '../utils/id';

interface AppContextValue {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  vendas: Venda[];
  setVendas: React.Dispatch<React.SetStateAction<Venda[]>>;
  receitas: Receita[];
  setReceitas: React.Dispatch<React.SetStateAction<Receita[]>>;
  notificacoes: Notificacao[];
  setNotificacoes: React.Dispatch<React.SetStateAction<Notificacao[]>>;
  adicionarNotificacao: (mensagem: string, tipo?: TipoNotificacao) => void;
  darBaixa: (produtoId: string, tipo: 'ML' | 'Unidade', quantidade: number) => boolean;
  nomeProdutoExiste: (nome: string, ignorarId?: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function carregarDoStorage<T>(chave: string, valorPadrao: T): T {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : valorPadrao;
  } catch {
    return valorPadrao;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>(() => carregarDoStorage('adega_produtos', []));
  const [vendas, setVendas] = useState<Venda[]>(() => carregarDoStorage('adega_vendas', []));
  const [receitas, setReceitas] = useState<Receita[]>(() => carregarDoStorage('adega_receitas', []));
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const adicionarNotificacao = (mensagem: string, tipo: TipoNotificacao = 'aviso') => {
    const id = gerarId();
    setNotificacoes(prev => [...prev, { id, mensagem, tipo }]);
    // Fecha automaticamente após 6 segundos caso o usuário não clique no X
    setTimeout(() => {
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  useEffect(() => {
    localStorage.setItem('adega_produtos', JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem('adega_vendas', JSON.stringify(vendas));
  }, [vendas]);

  useEffect(() => {
    localStorage.setItem('adega_receitas', JSON.stringify(receitas));
  }, [receitas]);

  // Evita produtos duplicados pelo nome (comparação case-insensitive, ignorando espaços extras)
  const nomeProdutoExiste = (nome: string, ignorarId?: string) => {
    const alvo = nome.trim().toLowerCase();
    return produtos.some(p => p.id !== ignorarId && p.nome.trim().toLowerCase() === alvo);
  };

  // Retorna true se a baixa foi aplicada, false se não havia produto ou estoque insuficiente
  const darBaixa = (produtoId: string, tipo: 'ML' | 'Unidade', quantidade: number): boolean => {
    const p = produtos.find(x => x.id === produtoId);
    if (!p) {
      adicionarNotificacao(`Produto não encontrado para dar baixa no estoque.`, 'erro');
      return false;
    }

    let desconto = quantidade;
    if (tipo === 'ML' && p.mlPorGarrafa > 0) {
      desconto = quantidade / p.mlPorGarrafa;
    }
    const estoqueFinal = p.qtd - desconto;
    const garrafasFechadas = Math.trunc(estoqueFinal);

    if (estoqueFinal < 0) {
      adicionarNotificacao(`Estoque insuficiente para: ${p.nome}. Venda bloqueada.`, 'erro');
      return false;
    }

    if (garrafasFechadas <= p.alertaMinimo) {
      adicionarNotificacao(`Estoque crítico para: ${p.nome} (Restam apenas ${garrafasFechadas} un)`, 'aviso');
    }

    setProdutos(prev => prev.map(prod =>
      prod.id === produtoId ? { ...prod, qtd: estoqueFinal } : prod
    ));
    return true;
  };

  return (
    <AppContext.Provider value={{
      produtos, setProdutos,
      vendas, setVendas,
      receitas, setReceitas,
      notificacoes, setNotificacoes,
      adicionarNotificacao,
      darBaixa,
      nomeProdutoExiste,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de conveniência do mesmo contexto, padrão comum em apps React
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp precisa ser usado dentro de um <AppProvider>');
  }
  return ctx;
}
