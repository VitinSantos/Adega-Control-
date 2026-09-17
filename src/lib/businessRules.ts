import type { Produto, Venda } from '../types';

export function calcularLucro(preco: number, custo: number): number {
  return Number((preco - custo).toFixed(2));
}

export function calcularMargem(preco: number, custo: number): number {
  return preco > 0 ? Number(((calcularLucro(preco, custo) / preco) * 100).toFixed(2)) : 0;
}

export function calcularEstoqueFinal(produto: Produto, tipo: 'ML' | 'Unidade', quantidade: number): number {
  const desconto = tipo === 'ML' && produto.mlPorGarrafa > 0
    ? quantidade / produto.mlPorGarrafa
    : quantidade;
  return Number((produto.qtd - desconto).toFixed(4));
}

export function classificarEstoque(produto: Produto): 'normal' | 'baixo' | 'critico' {
  const quantidade = Math.trunc(produto.qtd);
  if (quantidade <= 0 || quantidade <= produto.alertaCritico) return 'critico';
  if (quantidade <= produto.alertaMinimo) return 'baixo';
  return 'normal';
}

export function validarVenda(venda: Pick<Venda, 'preco' | 'custo' | 'lucro'>, estoqueFinal: number): string | null {
  if (venda.preco < 0 || venda.custo < 0 || venda.lucro !== calcularLucro(venda.preco, venda.custo)) {
    return 'Valores da venda inválidos.';
  }
  if (estoqueFinal < 0) return 'Estoque insuficiente.';
  return null;
}

export function normalizarQuantidade(valor: number): number | null {
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}
