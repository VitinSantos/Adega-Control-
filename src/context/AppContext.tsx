import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Produto, Venda, Receita, Notificacao, TipoNotificacao } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  produtoDoBanco, produtoParaBanco,
  receitaDoBanco, receitaParaBanco,
  vendaDoBanco, vendaParaBanco,
} from '../lib/mappers';

function mensagemDeErroOperacional(operacao: string, error?: { code?: string | null; status?: number; message?: string } | null) {
  if (error?.code === '23505') return 'Já existe um registro com esses dados.';
  if (error?.code === '23503') return 'Não é possível concluir: este registro está vinculado a outros dados.';
  if (error?.code === '23514' || error?.code === '22003') return 'Os dados informados não são válidos.';
  if (error?.status === 401 || error?.status === 403) return 'Você não tem permissão para realizar esta operação.';
  if (error?.status === 409) return 'A operação entrou em conflito. Atualize a tela e tente novamente.';
  return `Não foi possível ${operacao}. Tente novamente.`;
}

interface AppContextValue {
  produtos: Produto[];
  receitas: Receita[];
  vendas: Venda[];
  carregando: boolean;
  erroConexao: string | null;
  notificacoes: Notificacao[];
  setNotificacoes: React.Dispatch<React.SetStateAction<Notificacao[]>>;
  adicionarNotificacao: (mensagem: string, tipo?: TipoNotificacao) => void;
  nomeProdutoExiste: (nome: string, ignorarId?: string) => boolean;

  criarProduto: (dados: Omit<Produto, 'id'>) => Promise<boolean>;
  atualizarProduto: (produto: Produto) => Promise<boolean>;
  excluirProduto: (id: string) => Promise<boolean>;

  criarReceita: (dados: Omit<Receita, 'id'>) => Promise<boolean>;
  excluirReceita: (id: string) => Promise<boolean>;

  darBaixa: (produtoId: string, tipo: 'ML' | 'Unidade', quantidade: number) => Promise<boolean>;
  registrarVenda: (venda: Omit<Venda, 'id'>) => Promise<boolean>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroConexao, setErroConexao] = useState<string | null>(null);

  const adicionarNotificacao = (mensagem: string, tipo: TipoNotificacao = 'aviso') => {
    const id = crypto.randomUUID();
    setNotificacoes(prev => [...prev, { id, mensagem, tipo }]);
    if (tipo !== 'sucesso') {
      setTimeout(() => {
        setNotificacoes(prev => prev.filter(n => n.id !== id));
      }, 6000);
    }
  };

  useEffect(() => {
    async function carregarTudo() {
      setCarregando(true);
      setErroConexao(null);

      const [resProdutos, resReceitas, resVendas] = await Promise.all([
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('receitas').select('*').order('nome'),
        supabase.from('vendas').select('*').order('data_hora_iso', { ascending: true }),
      ]);

      if (resProdutos.error || resReceitas.error || resVendas.error) {
        const erro = resProdutos.error || resReceitas.error || resVendas.error;
        setErroConexao(mensagemDeErroOperacional('carregar os dados do sistema', erro));
        setCarregando(false);
        return;
      }

      setProdutos((resProdutos.data ?? []).map(produtoDoBanco));
      setReceitas((resReceitas.data ?? []).map(receitaDoBanco));
      setVendas((resVendas.data ?? []).map(vendaDoBanco));
      setCarregando(false);
    }

    carregarTudo();
  }, []);

  const nomeProdutoExiste = (nome: string, ignorarId?: string) => {
    const alvo = nome.trim().toLowerCase();
    return produtos.some(p => p.id !== ignorarId && p.nome.trim().toLowerCase() === alvo);
  };

  const criarProduto = async (dados: Omit<Produto, 'id'>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('produtos')
      .insert(produtoParaBanco(dados))
      .select()
      .single();

    if (error || !data) {
      adicionarNotificacao(mensagemDeErroOperacional('salvar o produto', error), 'erro');
      return false;
    }
    setProdutos(prev => [...prev, produtoDoBanco(data)]);
    return true;
  };

  const atualizarProduto = async (produto: Produto): Promise<boolean> => {
    const { data, error } = await supabase
      .from('produtos')
      .update(produtoParaBanco(produto))
      .eq('id', produto.id)
      .select()
      .single();

    if (error || !data) {
      adicionarNotificacao(mensagemDeErroOperacional('atualizar o produto', error), 'erro');
      return false;
    }
    setProdutos(prev => prev.map(p => (p.id === produto.id ? produtoDoBanco(data) : p)));
    return true;
  };

  const excluirProduto = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) {
      adicionarNotificacao(mensagemDeErroOperacional('excluir o produto', error), 'erro');
      return false;
    }
    setProdutos(prev => prev.filter(p => p.id !== id));
    return true;
  };

  const criarReceita = async (dados: Omit<Receita, 'id'>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('receitas')
      .insert(receitaParaBanco(dados))
      .select()
      .single();

    if (error || !data) {
      adicionarNotificacao(mensagemDeErroOperacional('salvar a receita', error), 'erro');
      return false;
    }
    setReceitas(prev => [...prev, receitaDoBanco(data)]);
    return true;
  };

  const excluirReceita = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('receitas').delete().eq('id', id);
    if (error) {
      adicionarNotificacao(mensagemDeErroOperacional('excluir a receita', error), 'erro');
      return false;
    }
    setReceitas(prev => prev.filter(r => r.id !== id));
    return true;
  };

  const darBaixa = async (produtoId: string, tipo: 'ML' | 'Unidade', quantidade: number): Promise<boolean> => {
    const p = produtos.find(x => x.id === produtoId);
    if (!p) {
      adicionarNotificacao('Produto não encontrado para dar baixa no estoque.', 'erro');
      return false;
    }

    let desconto = quantidade;
    if (tipo === 'ML' && p.mlPorGarrafa > 0) {
      desconto = quantidade / p.mlPorGarrafa;
    }
    const estoqueFinal = p.qtd - desconto;

    if (estoqueFinal < 0) {
      adicionarNotificacao(`Estoque insuficiente para: ${p.nome}. Venda bloqueada.`, 'erro');
      return false;
    }

    const { data, error } = await supabase
      .from('produtos')
      .update({ qtd: estoqueFinal })
      .eq('id', produtoId)
      .select()
      .single();

    if (error || !data) {
      adicionarNotificacao(mensagemDeErroOperacional('atualizar o estoque', error), 'erro');
      return false;
    }

    const garrafasFechadas = Math.trunc(estoqueFinal);
    if (garrafasFechadas <= p.alertaCritico) {
      adicionarNotificacao(`Estoque crítico: ${p.nome} tem apenas ${garrafasFechadas} un restantes.`, 'erro');
    } else if (garrafasFechadas <= p.alertaMinimo) {
      adicionarNotificacao(`Estoque baixo: ${p.nome} tem ${garrafasFechadas} un restantes.`, 'aviso');
    }

    setProdutos(prev => prev.map(prod => (prod.id === produtoId ? produtoDoBanco(data) : prod)));
    return true;
  };

  const registrarVenda = async (venda: Omit<Venda, 'id'>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('vendas')
      .insert(vendaParaBanco(venda))
      .select()
      .single();

    if (error || !data) {
      adicionarNotificacao(mensagemDeErroOperacional('registrar a venda', error), 'erro');
      return false;
    }
    setVendas(prev => [...prev, vendaDoBanco(data)]);
    return true;
  };

  return (
    <AppContext.Provider value={{
      produtos, receitas, vendas,
      carregando, erroConexao,
      notificacoes, setNotificacoes,
      adicionarNotificacao,
      nomeProdutoExiste,
      criarProduto, atualizarProduto, excluirProduto,
      criarReceita, excluirReceita,
      darBaixa, registrarVenda,
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
