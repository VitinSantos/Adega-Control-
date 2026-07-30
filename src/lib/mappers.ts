// Converte entre o formato de colunas do Supabase (snake_case) e os tipos
// usados no restante do app (camelCase), para não precisar mexer em todas
// as páginas quando o nome de uma coluna do banco mudar.

import type { Produto, Receita, Venda } from '../types';

interface ProdutoRow {
  id: string;
  nome: string;
  qtd: number | string;
  preco: number | string;
  preco_custo: number | string;
  ml_por_garrafa: number | string;
  alerta_minimo: number | string;
}

interface ReceitaRow {
  id: string;
  nome: string;
  preco: number | string;
  ingredientes: Receita['ingredientes'] | null;
}

interface VendaRow {
  id: string;
  nome: string;
  preco: number | string;
  custo: number | string;
  lucro: number | string;
  data: string;
  data_hora_iso: string;
}

export function produtoDoBanco(row: ProdutoRow): Produto {
  return {
    id: row.id,
    nome: row.nome,
    qtd: Number(row.qtd),
    preco: Number(row.preco),
    precoCusto: Number(row.preco_custo),
    mlPorGarrafa: Number(row.ml_por_garrafa),
    alertaMinimo: Number(row.alerta_minimo),
  };
}

export function produtoParaBanco(p: Omit<Produto, 'id'> | Produto) {
  return {
    nome: p.nome,
    qtd: p.qtd,
    preco: p.preco,
    preco_custo: p.precoCusto,
    ml_por_garrafa: p.mlPorGarrafa,
    alerta_minimo: p.alertaMinimo,
  };
}

export function receitaDoBanco(row: ReceitaRow): Receita {
  return {
    id: row.id,
    nome: row.nome,
    preco: Number(row.preco),
    ingredientes: row.ingredientes ?? [],
  };
}

export function receitaParaBanco(r: Omit<Receita, 'id'> | Receita) {
  return {
    nome: r.nome,
    preco: r.preco,
    ingredientes: r.ingredientes,
  };
}

export function vendaDoBanco(row: VendaRow): Venda {
  return {
    id: row.id,
    nome: row.nome,
    preco: Number(row.preco),
    custo: Number(row.custo),
    lucro: Number(row.lucro),
    data: row.data,
    dataHoraISO: row.data_hora_iso,
  };
}

export function vendaParaBanco(v: Omit<Venda, 'id'>) {
  return {
    nome: v.nome,
    preco: v.preco,
    custo: v.custo,
    lucro: v.lucro,
    data: v.data,
    data_hora_iso: v.dataHoraISO,
  };
}
