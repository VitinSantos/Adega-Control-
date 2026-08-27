import type { Produto, Receita, Venda, Ingrediente } from '../types';

type Row = Record<string, unknown>;
const num = (value: unknown) => Number(value ?? 0);

export function produtoDoBanco(row: Row): Produto { return { id: String(row.id), nome: String(row.nome), qtd: num(row.qtd), preco: num(row.preco_venda), precoCusto: num(row.preco_custo), mlPorGarrafa: num(row.ml_por_garrafa), alertaMinimo: 0 }; }
export function produtoParaBanco(p: Omit<Produto, 'id'> | Produto) { return { nome: p.nome, qtd: p.qtd, preco_custo: p.precoCusto, preco_venda: p.preco, ml_por_garrafa: p.mlPorGarrafa }; }
export function ingredienteDoBanco(row: Row, produto?: Produto): Ingrediente { return { produtoId: String(row.produto_id), nome: produto?.nome ?? String(row.nome ?? ''), tipo: row.tipo as 'ML' | 'Unidade', qtd: num(row.qtd) }; }
export function receitaDoBanco(row: Row, ingredientes: Ingrediente[] = []): Receita { return { id: String(row.id), nome: String(row.nome), preco: num(row.preco_venda), ingredientes }; }
export function receitaParaBanco(r: Omit<Receita, 'id'> | Receita) { return { nome: r.nome, preco_venda: r.preco }; }
export function vendaDoBanco(row: Row): Venda { return { id: String(row.id), nome: String(row.nome_snapshot ?? row.nome), preco: num(row.total_venda ?? row.preco), custo: num(row.custo_total ?? row.custo), lucro: num(row.lucro_total ?? row.lucro), data: String(row.data_hora ?? row.data ?? ''), dataHoraISO: String(row.data_hora ?? row.data_hora_iso ?? '') }; }
