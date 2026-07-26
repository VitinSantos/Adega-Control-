import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { gerarId } from '../utils/id';
import type { Produto, Receita, Venda } from '../types';

type ItemVenda = (Produto | Receita) & { tipo?: 'ML' | 'Unidade' };

export function Pdv() {
  const { produtos, receitas, vendas, setVendas, darBaixa, notificacoes, setNotificacoes, adicionarNotificacao } = useApp();
  const [iniciandoVenda, setIniciandoVenda] = useState(false);
  const [busca, setBusca] = useState('');

  const ehReceita = (item: ItemVenda): item is Receita => 'ingredientes' in item;

  const registrarVenda = (item: ItemVenda) => {
    let custoDoItem: number;

    if (ehReceita(item)) {
      // Confere se há estoque suficiente para TODOS os ingredientes antes de dar baixa em qualquer um
      for (const ing of item.ingredientes) {
        const prod = produtos.find((p) => p.id === ing.produtoId);
        if (!prod) {
          adicionarNotificacao(`Ingrediente "${ing.nome}" não encontrado no estoque.`, 'erro');
          return;
        }
        const descontoPrevisto = ing.tipo === 'ML' && prod.mlPorGarrafa > 0 ? ing.qtd / prod.mlPorGarrafa : ing.qtd;
        if (prod.qtd - descontoPrevisto < 0) {
          adicionarNotificacao(`Estoque insuficiente de "${prod.nome}" para preparar "${item.nome}".`, 'erro');
          return;
        }
      }

      // Calcula custo total baseado no preço de custo de cada ingrediente
      custoDoItem = item.ingredientes.reduce((acc, ing) => {
        const prod = produtos.find((p) => p.id === ing.produtoId);
        if (!prod) return acc;
        if (ing.tipo === 'ML' && prod.mlPorGarrafa > 0) {
          return acc + (prod.precoCusto / prod.mlPorGarrafa) * ing.qtd;
        }
        return acc + prod.precoCusto * ing.qtd;
      }, 0);

      // Agora sim aplica a baixa de cada ingrediente
      item.ingredientes.forEach((ing) => darBaixa(ing.produtoId, ing.tipo, ing.qtd));
    } else {
      custoDoItem = item.precoCusto || 0;
      const sucesso = darBaixa(item.id, 'Unidade', 1);
      if (!sucesso) return; // venda bloqueada por falta de estoque
    }

    const precoVenda = Number(item.preco || 0);

    const novaVenda: Venda = {
      id: gerarId(),
      nome: item.nome,
      preco: precoVenda,
      custo: custoDoItem,
      lucro: precoVenda - custoDoItem,
      data: new Date().toLocaleTimeString(),
      dataHoraISO: new Date().toISOString(),
    };

    setVendas([...vendas, novaVenda]);
    setIniciandoVenda(false);
    setBusca('');
  };

  const itensDisponiveis: ItemVenda[] = [...produtos, ...receitas];

  return (
    <div className="p-3 md:p-6 lg:p-8 relative">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[90%] md:w-full mx-auto">
        {notificacoes.map((n) => (
          <div key={n.id} className={`p-4 rounded shadow-xl text-white flex justify-between items-center transition-all ${n.tipo === 'erro' ? 'bg-red-600' : 'bg-amber-500'}`}>
            <span className="font-medium text-sm">{n.mensagem}</span>
            <button onClick={() => setNotificacoes(notificacoes.filter((x) => x.id !== n.id))} className="ml-4 font-bold">✕</button>
          </div>
        ))}
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-6">Ponto de Venda (PDV)</h2>

      <button
        onClick={() => setIniciandoVenda(!iniciandoVenda)}
        className="bg-emerald-600 text-white px-6 py-3 rounded font-bold mb-6 w-full md:w-auto hover:bg-emerald-700 transition shadow-lg"
      >
        {iniciandoVenda ? 'Cancelar Seleção' : 'Nova Venda'}
      </button>

      {iniciandoVenda && (
        <div className="bg-white p-4 md:p-6 border rounded shadow-lg mb-8">
          <input
            placeholder="Buscar produto ou receita..."
            className="border-2 border-emerald-100 focus:border-emerald-500 p-3 w-full mb-4 rounded outline-none"
            onChange={(e) => setBusca(e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {itensDisponiveis
              .filter((i) => i.nome?.toLowerCase().includes(busca.toLowerCase()))
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => registrarVenda(item)}
                  className="bg-white border-2 border-gray-100 p-4 rounded hover:border-emerald-500 hover:bg-emerald-50 text-left transition flex flex-col justify-between"
                >
                  <p className="font-bold text-gray-800">{item.nome}</p>
                  <p className="text-emerald-600 font-bold mt-1">R$ {Number(item.preco || 0).toFixed(2)}</p>
                </button>
              ))}
          </div>
        </div>
      )}

      <h3 className="font-bold mb-2 text-gray-700">Vendas Recentes:</h3>
      <div className="bg-white border rounded p-2 md:p-4 h-64 overflow-y-auto shadow-sm">
        {vendas.slice().reverse().map((v) => (
          <div key={v.id} className="border-b py-3 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 px-2 rounded gap-2">
            <div>
              <span className="text-sm text-gray-500 mr-2">{v.data}</span>
              <span className="font-bold text-gray-800">{v.nome}</span>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-emerald-600 font-bold">R$ {Number(v.preco || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">Lucro: R$ {Number(v.lucro || 0).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
