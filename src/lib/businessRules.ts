import type { ItemPedido, Produto, Receita, Venda } from '../types';

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

// ---------------------------------------------------------------------------
// Carrinho do PDV. Estas funções servem para orientar a tela (aviso de estoque,
// total estimado). A autoridade final é sempre o banco (função registrar_pedido).
// ---------------------------------------------------------------------------

function consumoDeUmaUnidade(item: ItemPedido, produtos: Produto[], receitas: Receita[]): Map<string, number> | null {
  const consumo = new Map<string, number>();

  if (item.tipo === 'produto') {
    if (!produtos.some((p) => p.id === item.id)) return null;
    consumo.set(item.id, 1);
    return consumo;
  }

  const receita = receitas.find((r) => r.id === item.id);
  if (!receita || receita.ingredientes.length === 0) return null;

  for (const ing of receita.ingredientes) {
    const prod = produtos.find((p) => p.id === ing.produtoId);
    if (!prod) return null;
    const desconto = ing.tipo === 'ML' && prod.mlPorGarrafa > 0 ? ing.qtd / prod.mlPorGarrafa : ing.qtd;
    consumo.set(prod.id, (consumo.get(prod.id) ?? 0) + desconto);
  }
  return consumo;
}

/** Consumo total de estoque (em garrafas/unidades) por produto. Retorna null se algum item ou ingrediente não existir. */
export function calcularConsumoDoCarrinho(
  itens: ItemPedido[],
  produtos: Produto[],
  receitas: Receita[],
): Map<string, number> | null {
  const total = new Map<string, number>();
  for (const item of itens) {
    const unidade = consumoDeUmaUnidade(item, produtos, receitas);
    if (!unidade) return null;
    for (const [id, qtd] of unidade) {
      total.set(id, (total.get(id) ?? 0) + qtd * item.quantidade);
    }
  }
  return total;
}

/** Primeiro produto cujo estoque não cobre o consumo, ou null se tudo estiver coberto. */
export function encontrarEstoqueInsuficiente(consumo: Map<string, number>, produtos: Produto[]): Produto | null {
  for (const [id, qtd] of consumo) {
    const prod = produtos.find((p) => p.id === id);
    if (prod && Number((prod.qtd - qtd).toFixed(4)) < 0) return prod;
  }
  return null;
}

/** Total apenas para exibição. O valor cobrado é calculado pelo servidor. */
export function calcularTotalEstimado(itens: ItemPedido[], produtos: Produto[], receitas: Receita[]): number {
  const total = itens.reduce((acc, item) => {
    const base = item.tipo === 'receita'
      ? receitas.find((r) => r.id === item.id)
      : produtos.find((p) => p.id === item.id);
    return acc + Number(base?.preco ?? 0) * item.quantidade;
  }, 0);
  return Number(total.toFixed(2));
}
