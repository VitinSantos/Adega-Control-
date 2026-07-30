import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Produto } from '../types';

export function Estoque() {
  const { produtos, notificacoes, setNotificacoes, adicionarNotificacao, nomeProdutoExiste, criarProduto, atualizarProduto, excluirProduto } = useApp();
  const [editando, setEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const nome = (f.elements.namedItem('nome') as HTMLInputElement).value.trim();
    const mlInput = Number((f.elements.namedItem('ml') as HTMLInputElement).value) || 0;

    if (!nome) {
      adicionarNotificacao('Informe o nome do produto.', 'erro');
      return;
    }

    if (nomeProdutoExiste(nome, editando?.id)) {
      adicionarNotificacao(`Já existe um produto chamado "${nome}".`, 'erro');
      return;
    }

    const dados = {
      nome,
      qtd: Number((f.elements.namedItem('qtd') as HTMLInputElement).value),
      preco: Number((f.elements.namedItem('preco') as HTMLInputElement).value),
      precoCusto: Number((f.elements.namedItem('custo') as HTMLInputElement).value),
      mlPorGarrafa: mlInput,
      alertaMinimo: Number((f.elements.namedItem('alerta') as HTMLInputElement).value),
    };

    setSalvando(true);
    const sucesso = editando
      ? await atualizarProduto({ ...dados, id: editando.id })
      : await criarProduto(dados);
    setSalvando(false);

    if (sucesso) {
      setEditando(null);
      f.reset();
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"? Essa ação não pode ser desfeita.`)) return;
    await excluirProduto(id);
  };

  return (
    <div className="p-8 relative">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {notificacoes.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded shadow-xl text-white flex justify-between items-center transition-all duration-300 ${n.tipo === 'erro' ? 'bg-red-600 border-l-4 border-red-800' : 'bg-amber-500 border-l-4 border-amber-700'}`}
          >
            <span className="font-medium text-sm">{n.mensagem}</span>
            <button onClick={() => setNotificacoes(notificacoes.filter((x) => x.id !== n.id))} className="ml-4 font-bold text-white hover:text-gray-200 text-lg">✕</button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6">{editando ? 'Editar Produto' : 'Estoque - Novo Produto'}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 bg-white p-4 border rounded shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Nome do Produto</label>
          <input name="nome" defaultValue={editando?.nome} placeholder="Ex: Jack Daniels" className="border p-2 rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">ML por Garrafa (Vazio = Unidade)</label>
          <input name="ml" type="number" defaultValue={editando?.mlPorGarrafa || ''} placeholder="Ex: 1000" className="border p-2 rounded" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Qtd em Estoque</label>
          <input name="qtd" type="number" step="0.01" min="0" defaultValue={editando?.qtd} placeholder="Ex: 5" className="border p-2 rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Preço de Compra (Custo)</label>
          <input name="custo" type="number" step="0.01" min="0" defaultValue={editando?.precoCusto} placeholder="Ex: 80.00" className="border p-2 rounded border-red-300 focus:border-red-500 outline-none" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Preço de Venda</label>
          <input name="preco" type="number" step="0.01" min="0" defaultValue={editando?.preco} placeholder="Ex: 150.00" className="border p-2 rounded border-emerald-300 focus:border-emerald-500 outline-none" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Alerta Mínimo (Un)</label>
          <input name="alerta" type="number" min="0" defaultValue={editando?.alertaMinimo} placeholder="Ex: 5" className="border p-2 rounded" required />
        </div>

        <div className="col-span-2 md:col-span-3 flex gap-2">
          <button disabled={salvando} className="flex-1 bg-emerald-600 text-white py-2 font-bold rounded hover:bg-emerald-700 transition disabled:opacity-50">
            {salvando ? 'Salvando...' : editando ? 'Salvar Edição' : 'Adicionar ao Estoque'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="px-4 bg-gray-200 text-gray-700 py-2 font-bold rounded hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table className="w-full bg-white border rounded shadow-sm text-sm md:text-base">
        <thead>
          <tr className="bg-gray-100 border-b text-left">
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
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">
                  {p.nome} <br />
                  <span className={`text-xs ${estoqueZeradoOuNegativo ? 'text-red-500' : 'text-gray-500'}`}>
                    {p.mlPorGarrafa > 0 ? `${volumeTotalML} ml total` : ''}
                  </span>
                </td>
                <td className={`p-4 font-bold ${estoqueZeradoOuNegativo ? 'text-red-600' : garrafasFechadas <= p.alertaMinimo ? 'text-amber-600' : 'text-gray-800'}`}>
                  {garrafasFechadas} un {estoqueZeradoOuNegativo ? '❌' : garrafasFechadas <= p.alertaMinimo ? '⚠️' : ''}
                </td>
                <td className="p-4 text-red-600 font-medium">R$ {p.precoCusto?.toFixed(2) || '0.00'}</td>
                <td className="p-4 text-emerald-600 font-bold">R$ {p.preco.toFixed(2)}</td>
                <td className="p-4 flex gap-2 justify-center">
                  <button onClick={() => setEditando(p)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Editar</button>
                  <button onClick={() => handleExcluir(p.id, p.nome)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Excluir</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
