import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { gerarId } from '../utils/id';
import type { Produto } from '../types';

export function Estoque() {
  const { produtos, setProdutos, notificacoes, setNotificacoes, adicionarNotificacao, nomeProdutoExiste } = useApp();
  const [editando, setEditando] = useState<Produto | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const nome = (f.elements.namedItem('nome') as HTMLInputElement).value.trim();
    const mlInput = Number((f.elements.namedItem('ml') as HTMLInputElement).value) || 0;

    if (!nome) {
      adicionarNotificacao('Informe o nome do produto.', 'erro');
      return;
    }

    // Bloqueia nomes duplicados (ignorando o próprio produto quando estamos editando)
    if (nomeProdutoExiste(nome, editando?.id)) {
      adicionarNotificacao(`Já existe um produto chamado "${nome}".`, 'erro');
      return;
    }

    const dados: Produto = {
      id: editando ? editando.id : gerarId(),
      nome,
      qtd: Number((f.elements.namedItem('qtd') as HTMLInputElement).value),
      preco: Number((f.elements.namedItem('preco') as HTMLInputElement).value),
      precoCusto: Number((f.elements.namedItem('custo') as HTMLInputElement).value),
      mlPorGarrafa: mlInput,
      alertaMinimo: Number((f.elements.namedItem('alerta') as HTMLInputElement).value),
    };

    if (editando) {
      setProdutos(produtos.map(p => (p.id === editando.id ? dados : p)));
      setEditando(null);
    } else {
      setProdutos([...produtos, dados]);
    }
    f.reset();
  };

  return (
    <div className="p-8 relative bg-adega-bg text-adega-text min-h-full transition-colors">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {notificacoes.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl shadow-xl text-white flex justify-between items-center transition-all duration-300 ${n.tipo === 'erro' ? 'bg-red-600 border-l-4 border-red-800' : 'bg-amber-500 border-l-4 border-amber-700'}`}
          >
            <span className="font-medium text-sm">{n.mensagem}</span>
            <button onClick={() => setNotificacoes(notificacoes.filter((x) => x.id !== n.id))} className="ml-4 font-bold text-white hover:text-gray-200 text-lg">✕</button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-adega-text">{editando ? 'Editar Produto' : 'Estoque - Novo Produto'}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 bg-adega-card border border-adega-border p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">Nome do Produto</label>
          <input name="nome" defaultValue={editando?.nome} placeholder="Ex: Jack Daniels" className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">ML por Garrafa (Vazio = Unidade)</label>
          <input name="ml" type="number" defaultValue={editando?.mlPorGarrafa || ''} placeholder="Ex: 1000" className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">Qtd em Estoque</label>
          <input name="qtd" type="number" step="0.01" defaultValue={editando?.qtd} placeholder="Ex: 5" className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">Preço de Compra (Custo)</label>
          <input name="custo" type="number" step="0.01" defaultValue={editando?.precoCusto} placeholder="Ex: 80.00" className="border border-red-300 dark:border-red-900 p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-red-500" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">Preço de Venda</label>
          <input name="preco" type="number" step="0.01" defaultValue={editando?.preco} placeholder="Ex: 150.00" className="border border-emerald-300 dark:border-emerald-900 p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">Alerta Mínimo (Un)</label>
          <input name="alerta" type="number" defaultValue={editando?.alertaMinimo} placeholder="Ex: 5" className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
        </div>

        <div className="col-span-2 md:col-span-3 flex gap-2 pt-2">
          <button className="flex-1 bg-emerald-600 text-white py-3 font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20">
            {editando ? 'Salvar Edição' : 'Adicionar ao Estoque'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="px-6 bg-adega-bg border border-adega-border text-adega-text py-3 font-bold rounded-xl hover:bg-adega-border/50 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="bg-adega-card border border-adega-border rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-sm md:text-base border-collapse">
          <thead>
            <tr className="bg-adega-bg border-b border-adega-border text-left text-adega-muted">
              <th className="p-4">Produto</th>
              <th className="p-4">Qtd</th>
              <th className="p-4">Custo</th>
              <th className="p-4">Venda</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => {
              const garrafasFechadas = Math.trunc(p.qtd);
              const volumeTotalML = p.mlPorGarrafa > 0 ? Math.round(p.qtd * p.mlPorGarrafa) : 0;
              const estoqueZeradoOuNegativo = p.qtd <= 0;

              return (
                <tr key={p.id} className="border-b border-adega-border hover:bg-adega-bg/50 transition-colors">
                  <td className="p-4 font-medium text-adega-text">
                    {p.nome} <br />
                    <span className={`text-xs ${estoqueZeradoOuNegativo ? 'text-red-500' : 'text-adega-muted'}`}>
                      {p.mlPorGarrafa > 0 ? `${volumeTotalML} ml total` : ''}
                    </span>
                  </td>
                  <td className={`p-4 font-bold ${estoqueZeradoOuNegativo ? 'text-red-500' : garrafasFechadas <= p.alertaMinimo ? 'text-amber-500' : 'text-adega-text'}`}>
                    {garrafasFechadas} un {estoqueZeradoOuNegativo ? '❌' : garrafasFechadas <= p.alertaMinimo ? '⚠️' : ''}
                  </td>
                  <td className="p-4 text-red-500 font-medium">R$ {p.precoCusto?.toFixed(2) || '0.00'}</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">R$ {p.preco.toFixed(2)}</td>
                  <td className="p-4 flex gap-2 justify-center">
                    <button onClick={() => setEditando(p)} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition text-xs font-bold">Editar</button>
                    <button onClick={() => setProdutos(produtos.filter((x) => x.id !== p.id))} className="bg-red-600 text-white px-3 py-1.5 rounded-xl hover:bg-red-700 transition text-xs font-bold">Excluir</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}