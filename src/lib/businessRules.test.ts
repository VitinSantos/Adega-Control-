import { describe, expect, it } from 'vitest';
import type { Produto } from '../types';
import {
  calcularEstoqueFinal,
  calcularLucro,
  calcularMargem,
  classificarEstoque,
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
