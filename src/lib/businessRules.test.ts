import { describe, expect, it } from 'vitest';
import type { Produto, Receita } from '../types';
import {
  calcularConsumoDoCarrinho,
  calcularEstoqueFinal,
  calcularLucro,
  calcularMargem,
  calcularTotalEstimado,
  classificarEstoque,
  encontrarEstoqueInsuficiente,
  normalizarQuantidade,
  validarVenda,
} from './businessRules';

const produto = (qtd: number, alertaMinimo = 10, alertaCritico = 5): Produto => ({
  id: 'produto-1', nome: 'Ice', qtd, preco: 15, precoCusto: 70, mlPorGarrafa: 1000,
  alertaMinimo, alertaCritico,
});

describe('cálculos financeiros', () => {
  it('calcula lucro e margem', () => {
    expect(calcularLucro(100, 70)).toBe(30);
    expect(calcularMargem(100, 70)).toBe(30);
  });

  it('evita margem inválida quando o preço é zero', () => {
    expect(calcularMargem(0, 10)).toBe(0);
  });
});

describe('estoque e alertas', () => {
  it('baixa unidades e mililitros corretamente', () => {
    expect(calcularEstoqueFinal(produto(30), 'Unidade', 2)).toBe(28);
    expect(calcularEstoqueFinal(produto(30), 'ML', 500)).toBe(29.5);
  });

  it('classifica normal, baixo e crítico com limites configuráveis', () => {
    expect(classificarEstoque(produto(30))).toBe('normal');
    expect(classificarEstoque(produto(10))).toBe('baixo');
    expect(classificarEstoque(produto(5))).toBe('critico');
    expect(classificarEstoque(produto(1, 15, 1))).toBe('critico');
  });
});

describe('vendas', () => {
  it('aceita venda consistente e rejeita lucro adulterado', () => {
    expect(validarVenda({ preco: 100, custo: 70, lucro: 30 }, 4)).toBeNull();
    expect(validarVenda({ preco: 100, custo: 70, lucro: 99 }, 4)).toBe('Valores da venda inválidos.');
  });

  it('rejeita estoque insuficiente e quantidades inválidas', () => {
    expect(validarVenda({ preco: 100, custo: 70, lucro: 30 }, -1)).toBe('Estoque insuficiente.');
    expect(normalizarQuantidade(0)).toBeNull();
    expect(normalizarQuantidade(2)).toBe(2);
  });
});

describe('carrinho do PDV', () => {
  const prod = (id: string, qtd: number, mlPorGarrafa = 1000): Produto => ({
    id, nome: id, qtd, preco: 10, precoCusto: 5, mlPorGarrafa, alertaMinimo: 1, alertaCritico: 0,
  });
  const drink: Receita = {
    id: 'drink', nome: 'Drink', preco: 50,
    ingredientes: [
      { produtoId: 'bebida', nome: 'Bebida', tipo: 'ML', qtd: 50 },
      { produtoId: 'gelo', nome: 'Gelo', tipo: 'Unidade', qtd: 1 },
    ],
  };

  it('calcula o consumo de receitas (ML vira fração de garrafa) e de produtos', () => {
    const produtos = [prod('bebida', 10), prod('gelo', 10)];
    const consumo = calcularConsumoDoCarrinho(
      [{ tipo: 'receita', id: 'drink', quantidade: 2 }, { tipo: 'produto', id: 'gelo', quantidade: 1 }],
      produtos, [drink],
    );
    expect(consumo?.get('bebida')).toBeCloseTo(0.1, 6);
    expect(consumo?.get('gelo')).toBe(3);
  });

  it('retorna null quando item ou ingrediente não existe', () => {
    expect(calcularConsumoDoCarrinho([{ tipo: 'produto', id: 'x', quantidade: 1 }], [], [])).toBeNull();
    expect(calcularConsumoDoCarrinho([{ tipo: 'receita', id: 'drink', quantidade: 1 }], [prod('bebida', 10)], [drink])).toBeNull();
  });

  it('detecta estoque insuficiente somente quando falta de fato', () => {
    const consumo = new Map([['bebida', 0.05]]);
    expect(encontrarEstoqueInsuficiente(consumo, [prod('bebida', 0.04)])?.id).toBe('bebida');
    expect(encontrarEstoqueInsuficiente(consumo, [prod('bebida', 0.05)])).toBeNull();
  });

  it('soma o total estimado por quantidade', () => {
    const produtos = [prod('bebida', 10), prod('gelo', 10)];
    const total = calcularTotalEstimado(
      [{ tipo: 'receita', id: 'drink', quantidade: 2 }, { tipo: 'produto', id: 'gelo', quantidade: 3 }],
      produtos, [drink],
    );
    expect(total).toBe(130);
  });
});
