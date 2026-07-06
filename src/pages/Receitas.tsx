import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function Receitas() {
  const { produtos, receitas, setReceitas } = useApp();
  const [ingredientes, setIngredientes] = useState<any[]>([]);

  const salvar = (e: any) => {
    e.preventDefault();
    const f = e.target;
    if (ingredientes.length === 0) return alert("Adicione pelo menos um ingrediente!");
    
    setReceitas([...receitas, { nome: f.nome.value, preco: f.preco.value, ingredientes }]);
    f.reset(); 
    setIngredientes([]);
  };

  const adicionarIngrediente = () => {
    const selectProd = document.getElementById('prod') as HTMLSelectElement;
    const selectTipo = document.getElementById('tipo') as HTMLSelectElement;
    const inputQtd = document.getElementById('qtd') as HTMLInputElement;
    
    const nome = selectProd.value;
    const tipo = selectTipo.value;
    const qtd = Number(inputQtd.value);
    
    if (qtd <= 0) return alert("Quantidade inválida");
    if (!nome) return alert("Selecione um produto");
    
    setIngredientes([...ingredientes, { nome, tipo, qtd }]);
    inputQtd.value = ''; // Limpa o campo de quantidade após adicionar
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Receitas</h2>
      <form onSubmit={salvar} className="bg-white p-4 border rounded shadow-sm mb-8">
        <input name="nome" placeholder="Nome da Receita" className="border p-2 w-full mb-2" required />
        <input name="preco" type="number" step="0.01" placeholder="Preço de Venda" className="border p-2 w-full mb-4" required />
        
        <div className="flex gap-2 mb-4 items-center">
          <select id="prod" className="border p-2 flex-1">
            {produtos.map((p:any) => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
          </select>
          <select id="tipo" className="border p-2">
            <option value="ML">ML</option>
            <option value="Unidade">Unidade</option>
          </select>
          <input id="qtd" type="number" placeholder="Qtd" className="border p-2 w-20" />
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
        <button type="submit" className="bg-emerald-600 text-white w-full py-2 font-bold rounded">Salvar Receita Completa</button>
      </form>

      <h2 className="text-xl font-bold mb-4">Receitas Cadastradas</h2>
      <div className="grid gap-2">
        {receitas.map((r: any, i: number) => (
          <div key={i} className="bg-white p-4 border rounded flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-lg">{r.nome}</p>
              <p className="text-sm text-gray-500">R$ {r.preco} | Ingredientes: {r.ingredientes.map((ing:any) => ing.nome).join(', ')}</p>
            </div>
            <button onClick={() => setReceitas(receitas.filter((_:any, idx:number) => idx !== i))} className="bg-red-500 text-white px-3 py-1 rounded">Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}