import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Produto, Venda, Receita, ItemPedido, Notificacao, TipoNotificacao } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  produtoDoBanco, produtoParaBanco,
  receitaDoBanco, receitaParaBanco,
  vendaDoBanco,
} from '../lib/mappers';

function mensagemDeErroOperacional(operacao: string, error?: { code?: string | null; status?: number; message?: string } | null) {
  if (error?.code === '23505') return 'Já existe um registro com esses dados.';
  if (error?.code === '23503') return 'Não é possível concluir: este registro está vinculado a outros dados.';
  if (error?.code === '23514' || error?.code === '22003') return 'Os dados informados não são válidos.';
  if (error?.status === 401 || error?.status === 403) return 'Você não tem permissão para realizar esta operação.';
  if (error?.status === 409) return 'A operação entrou em conflito. Atualize a tela e tente novamente.';
  return `Não foi possível ${operacao}. Tente novamente.`;
}

type ErroDoServidor = { code?: string | null; status?: number; message?: string; details?: string | null } | null | undefined;

// O banco responde com códigos fixos (ex.: ESTOQUE_INSUFICIENTE) para a tela explicar o motivo com clareza.
function mensagemDeErroDoPedido(error?: ErroDoServidor) {
  const detalhe = error?.details ?? '';
  switch (error?.message) {
    case 'ESTOQUE_INSUFICIENTE':
      return `Estoque insuficiente de "${detalhe || 'um item'}". Ajuste o carrinho e tente novamente.`;
    case 'ITEM_NAO_ENCONTRADO':
      return 'Um item do carrinho não existe mais. Atualize a página e tente novamente.';
    case 'INGREDIENTE_NAO_ENCONTRADO':
      return `Um ingrediente da receita "${detalhe}" não existe mais no estoque.`;
    case 'INGREDIENTE_INVALIDO':
    case 'RECEITA_SEM_INGREDIENTES':
      return `A receita "${detalhe}" está incompleta ou inválida.`;
    case 'PEDIDO_INVALIDO':
      return 'O pedido é inválido. Revise as quantidades (máximo de 99 por item e 200 no total).';
    case 'SEM_EMPRESA':
      return 'Sua conta ainda não está vinculada a uma empresa.';
    default:
      return mensagemDeErroOperacional('registrar a venda', error);
  }
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

  // Preço, custo, data e baixa de estoque são definidos pelo servidor. Retorna as vendas gravadas, ou null em caso de erro.
  registrarPedido: (itens: ItemPedido[], pedidoId: string) => Promise<Venda[] | null>;
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
    let ativo = true;

    const limparDados = () => {
      setProdutos([]);
      setReceitas([]);
      setVendas([]);
      setErroConexao(null);
    };

    const carregarTudo = async () => {
      setCarregando(true);
      setErroConexao(null);

      const [resProdutos, resReceitas, resVendas] = await Promise.all([
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('receitas').select('*').order('nome'),
        supabase.from('vendas').select('*').order('data_hora_iso', { ascending: true }),
      ]);

      if (!ativo) return;

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
    };

    const sincronizarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!ativo) return;

      if (session) {
        await carregarTudo();
      } else {
        limparDados();
        setCarregando(false);
      }
    };

    sincronizarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!ativo) return;

      if (session) {
        void carregarTudo();
      } else {
        limparDados();
        setCarregando(false);
      }
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
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

  const registrarPedido = async (itens: ItemPedido[], pedidoId: string): Promise<Venda[] | null> => {
    const { data, error } = await supabase.rpc('registrar_pedido', {
      p_itens: itens.map((item) => ({ tipo: item.tipo, id: item.id, quantidade: item.quantidade })),
      p_pedido_id: pedidoId,
    });

    if (error || !data || data.length === 0) {
      adicionarNotificacao(mensagemDeErroDoPedido(error), 'erro');
      return null;
    }

    const registradas = (data as Parameters<typeof vendaDoBanco>[0][]).map(vendaDoBanco);
    setVendas((prev) => {
      const jaExistentes = new Set(prev.map((venda) => venda.id));
      return [...prev, ...registradas.filter((venda) => !jaExistentes.has(venda.id))];
    });

    // O estoque mudou no servidor (inclusive ingredientes de receitas): recarrega os produtos.
    const { data: produtosAtualizados } = await supabase.from('produtos').select('*').order('nome');
    if (produtosAtualizados) setProdutos(produtosAtualizados.map(produtoDoBanco));

    return registradas;
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
  registrarPedido,
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
