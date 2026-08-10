import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Ingrediente } from '../types';

export function Receitas() {
  const { produtos, receitas, adicionarNotificacao, criarReceita, excluirReceita } = useApp();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [salvando, setSalvando] = useState(false);

  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState<'ML' | 'Unidade'>('ML');
  const [qtdIngrediente, setQtdIngrediente] = useState('');

  const salvar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (ingredientes.length === 0) {
      adicionarNotificacao('Adicione pelo menos um ingrediente!', 'erro');
      return;
    }

    const nome = (f.elements.namedItem('nome') as HTMLInputElement).value.trim();
    const preco = Number((f.elements.namedItem('preco') as HTMLInputElement).value);

    setSalvando(true);
    const sucesso = await criarReceita({ nome, preco, ingredientes });
    setSalvando(false);

    if (sucesso) {
      f.reset();
      setIngredientes([]);
      setProdutoSelecionadoId('');
      setQtdIngrediente('');
    }
  };

  const adicionarIngrediente = () => {
    const qtd = Number(qtdIngrediente);

    if (!produtoSelecionadoId) {
      adicionarNotificacao('Selecione um produto.', 'erro');
      return;
    }
    if (!qtd || qtd <= 0) {
      adicionarNotificacao('Quantidade inválida.', 'erro');
      return;
    }

    const produto = produtos.find((p) => p.id === produtoSelecionadoId);
    if (!produto) return;

    setIngredientes([...ingredientes, { produtoId: produto.id, nome: produto.nome, tipo: tipoSelecionado, qtd }]);
    setQtdIngrediente('');
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a receita "${nome}"?`)) return;
    await excluirReceita(id);
  };

  return (
    <div className="p-8 bg-adega-bg text-adega-text min-h-full transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-adega-text">Cadastrar Receitas</h2>
      <form onSubmit={salvar} className="bg-adega-card border border-adega-border p-6 rounded-3xl shadow-sm mb-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-adega-muted mb-1">Nome da Receita</label>
          <input name="nome" placeholder="Ex: Caipirinha de Limão" className="border border-adega-border p-3 w-full rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-adega-muted mb-1">Preço de Venda</label>
          <input name="preco" type="number" step="0.01" min="0" placeholder="Ex: 20.00" className="border border-adega-border p-3 w-full rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
        </div>

        <div className="pt-2">
          <label className="block text-xs font-semibold text-adega-muted mb-1">Adicionar Ingredientes</label>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <select
              value={produtoSelecionadoId}
              onChange={(e) => setProdutoSelecionadoId(e.target.value)}
              className="border border-adega-border p-3 flex-1 rounded-xl bg-adega-bg text-adega-text outline-none focus:ring-2 focus:ring-emerald-500 w-full"
            >
              <option value="">Selecione um produto...</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <select
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value as 'ML' | 'Unidade')}
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="ML">ML</option>
              <option value="Unidade">Unidade</option>
            </select>
            <input
              value={qtdIngrediente}
              onChange={(e) => setQtdIngrediente(e.target.value)}
              type="number"
              min="0"
              placeholder="Qtd"
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-28"
            />
            <button type="button" onClick={adicionarIngrediente} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full sm:w-auto shadow-sm">+</button>
          </div>
        </div>

        <ul className="mb-4 bg-adega-bg p-3 border border-adega-border rounded-2xl space-y-2">
          {ingredientes.length === 0 && <li className="text-adega-muted text-xs italic text-center py-2">Nenhum ingrediente adicionado...</li>}
          {ingredientes.map((ing, i) => (
            <li key={i} className="flex justify-between items-center p-2 border-b border-adega-border/50 text-sm">
              <span className="text-adega-text font-medium">{ing.nome} ({ing.tipo}): <strong className="text-emerald-500">{ing.qtd}</strong></span>
              <button type="button" onClick={() => setIngredientes(ingredientes.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400 text-xs font-bold transition">Remover</button>
            </li>
          ))}
        </ul>

        <button type="submit" disabled={salvando} className="bg-emerald-600 text-white w-full py-3.5 font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar Receita Completa'}
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4 text-adega-text">Receitas Cadastradas</h2>
      <div className="grid gap-3">
        {receitas.length === 0 ? (
          <div className="bg-adega-card border border-adega-border p-6 rounded-3xl text-center text-adega-muted text-xs shadow-sm">
            Nenhuma receita cadastrada.
          </div>
        ) : (
          receitas.map((r) => (
            <div key={r.id} className="bg-adega-card border border-adega-border p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4 transition hover:border-adega-text/30">
              <div>
                <p className="font-bold text-lg text-adega-text">{r.nome}</p>
                <p className="text-xs text-emerald-500 font-semibold mt-0.5">R$ {Number(r.preco || 0).toFixed(2)}</p>
                <p className="text-xs text-adega-muted mt-1">Ingredientes: {r.ingredientes.map((ing) => `${ing.nome} (${ing.qtd}${ing.tipo})`).join(', ')}</p>
              </div>
              <button onClick={() => handleExcluir(r.id, r.nome)} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition shadow-sm">Excluir</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
