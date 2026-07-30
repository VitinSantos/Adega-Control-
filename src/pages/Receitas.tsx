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
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Receitas</h2>
      <form onSubmit={salvar} className="bg-white p-4 border rounded shadow-sm mb-8">
        <input name="nome" placeholder="Nome da Receita" className="border p-2 w-full mb-2" required />
        <input name="preco" type="number" step="0.01" min="0" placeholder="Preço de Venda" className="border p-2 w-full mb-4" required />

        <div className="flex gap-2 mb-4 items-center">
          <select
            value={produtoSelecionadoId}
            onChange={(e) => setProdutoSelecionadoId(e.target.value)}
            className="border p-2 flex-1"
          >
            <option value="">Selecione um produto...</option>
            {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <select
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value as 'ML' | 'Unidade')}
            className="border p-2"
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
            className="border p-2 w-20"
          />
          <button type="button" onClick={adicionarIngrediente} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">+</button>
        </div>

        <ul className="mb-4 bg-gray-50 p-2 border rounded">
          {ingredientes.length === 0 && <li className="text-gray-400 text-sm italic">Nenhum ingrediente adicionado...</li>}
          {ingredientes.map((ing, i) => (
            <li key={i} className="flex justify-between p-1 border-b">
              {ing.nome} ({ing.tipo}): {ing.qtd}
              <button type="button" onClick={() => setIngredientes(ingredientes.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">Remover</button>
            </li>
          ))}
        </ul>
        <button type="submit" disabled={salvando} className="bg-emerald-600 text-white w-full py-2 font-bold rounded disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar Receita Completa'}
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4">Receitas Cadastradas</h2>
      <div className="grid gap-2">
        {receitas.map((r) => (
          <div key={r.id} className="bg-white p-4 border rounded flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-lg">{r.nome}</p>
              <p className="text-sm text-gray-500">R$ {r.preco} | Ingredientes: {r.ingredientes.map((ing) => ing.nome).join(', ')}</p>
            </div>
            <button onClick={() => handleExcluir(r.id, r.nome)} className="bg-red-500 text-white px-3 py-1 rounded">Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}
