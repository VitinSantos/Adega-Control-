import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Produto, Venda, Receita, Notificacao, TipoNotificacao, Perfil } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  produtoDoBanco, produtoParaBanco,
  receitaDoBanco, receitaParaBanco,
  vendaDoBanco, vendaParaBanco,
} from '../lib/mappers';

interface AppContextValue {
  sessao: Session | null;
  perfil: Perfil | null;
  autenticando: boolean;
  erroLogin: string | null;
  entrar: (email: string, senha: string) => Promise<boolean>;
  sair: () => Promise<void>;

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
  const [sessao, setSessao] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [autenticando, setAutenticando] = useState(true);
  const [erroLogin, setErroLogin] = useState<string | null>(null);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erroConexao, setErroConexao] = useState<string | null>(null);

  const adicionarNotificacao = (mensagem: string, tipo: TipoNotificacao = 'aviso') => {
    const id = crypto.randomUUID();
    setNotificacoes(prev => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setAutenticando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      if (!novaSessao) {
        setPerfil(null);
        setProdutos([]);
        setReceitas([]);
        setVendas([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function buscarPerfil() {
      if (!sessao) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, role, loja_id')
        .eq('id', sessao.user.id)
        .single();

      if (error || !data) {
        setErroConexao(`Não foi possível carregar seu perfil: ${error?.message}`);
        return;
      }

      if (!data.loja_id) {
        setErroConexao('Sua conta ainda não está vinculada a nenhuma loja. Peça para um administrador configurar seu acesso.');
        return;
      }

      setPerfil({ id: data.id, nome: data.nome, role: data.role, lojaId: data.loja_id });
    }

    buscarPerfil();
  }, [sessao]);

  const entrar = async (email: string, senha: string): Promise<boolean> => {
    setErroLogin(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErroLogin(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message
      );
      return false;
    }
    return true;
  };

  const sair = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    async function carregarTudo() {
      if (!perfil) return;

      setCarregando(true);
      setErroConexao(null);

      const [resProdutos, resReceitas, resVendas] = await Promise.all([
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('receitas').select('*').order('nome'),
        supabase.from('vendas').select('*').order('data_hora_iso', { ascending: true }),
      ]);

      if (resProdutos.error || resReceitas.error || resVendas.error) {
        const erro = resProdutos.error || resReceitas.error || resVendas.error;
        setErroConexao(`Não foi possível conectar ao banco de dados: ${erro?.message}`);
        setCarregando(false);
        return;
      }

      setProdutos((resProdutos.data ?? []).map(produtoDoBanco));
      setReceitas((resReceitas.data ?? []).map(receitaDoBanco));
      setVendas((resVendas.data ?? []).map(vendaDoBanco));
      setCarregando(false);
    }

    carregarTudo();
  }, [perfil]);

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
      adicionarNotificacao(`Erro ao salvar produto: ${error?.message}`, 'erro');
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
      adicionarNotificacao(`Erro ao atualizar produto: ${error?.message}`, 'erro');
      return false;
    }
    setProdutos(prev => prev.map(p => (p.id === produto.id ? produtoDoBanco(data) : p)));
    return true;
  };

  const excluirProduto = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) {
      adicionarNotificacao(`Erro ao excluir produto: ${error.message}`, 'erro');
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
      adicionarNotificacao(`Erro ao salvar receita: ${error?.message}`, 'erro');
      return false;
    }
    setReceitas(prev => [...prev, receitaDoBanco(data)]);
    return true;
  };

  const excluirReceita = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('receitas').delete().eq('id', id);
    if (error) {
      adicionarNotificacao(`Erro ao excluir receita: ${error.message}`, 'erro');
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
      adicionarNotificacao(`Erro ao atualizar estoque de ${p.nome}: ${error?.message}`, 'erro');
      return false;
    }

    const garrafasFechadas = Math.trunc(estoqueFinal);
    if (garrafasFechadas <= p.alertaMinimo) {
      adicionarNotificacao(`Estoque crítico para: ${p.nome} (Restam apenas ${garrafasFechadas} un)`, 'aviso');
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
      adicionarNotificacao(`Erro ao registrar venda: ${error?.message}`, 'erro');
      return false;
    }
    setVendas(prev => [...prev, vendaDoBanco(data)]);
    return true;
  };

  return (
    <AppContext.Provider value={{
      sessao, perfil, autenticando, erroLogin, entrar, sair,
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
