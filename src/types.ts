// Tipos centrais usados em todo o sistema

export interface Produto {
  id: string;
  nome: string;
  qtd: number;
  preco: number;
  precoCusto: number;
  mlPorGarrafa: number;
  alertaMinimo: number;
}

export interface Ingrediente {
  produtoId: string;
  nome: string; // guardado para exibição rápida, sem precisar buscar o produto
  tipo: 'ML' | 'Unidade';
  qtd: number;
}

export interface Receita {
  id: string;
  nome: string;
  preco: number;
  ingredientes: Ingrediente[];
}

export interface Venda {
  id: string;
  nome: string;
  preco: number;
  custo: number;
  lucro: number;
  data: string;
  dataHoraISO: string;
}

export type TipoNotificacao = 'aviso' | 'erro';

export interface Notificacao {
  id: string;
  mensagem: string;
  tipo: TipoNotificacao;
}
