import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function Estoque() {
  const { produtos, setProdutos, notificacoes, setNotificacoes } = useApp();
  const [editando, setEditando] = useState<any>(null);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = e.target;
    const mlInput = Number(f.ml.value) || 0; 

    const dados = {
      nome: f.nome.value,
      qtd: Number(f.qtd.value),
      preco: Number(f.preco.value),
      precoCusto: Number(f.custo.value), // NOVO: Valor de Compra
      mlPorGarrafa: mlInput,
      alertaMinimo: Number(f.alerta.value)
    };

    if (editando) {
      setProdutos(produtos.map((p: any) => p.nome === editando.nome ? dados : p));
      setEditando(null);
    } else {
      setProdutos([...produtos, dados]);
    }
    f.reset();
  };

  return (
    <div className="p-8 relative">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {notificacoes.map((n: any) => (
          <div 
            key={n.id} 
            className={`p-4 rounded shadow-xl text-white flex justify-between items-center transition-all duration-300 ${n.tipo === 'erro' ? 'bg-red-600 border-l-4 border-red-800' : 'bg-amber-500 border-l-4 border-amber-700'}`}
          >
            <span className="font-medium text-sm">{n.mensagem}</span>
            <button onClick={() => setNotificacoes(notificacoes.filter((x: any) => x.id !== n.id))} className="ml-4 font-bold text-white hover:text-gray-200 text-lg">✕</button>
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
          <input name="qtd" type="number" step="0.01" defaultValue={editando?.qtd} placeholder="Ex: 5" className="border p-2 rounded" required />
        </div>

        {/* NOVO CAMPO: Valor de Compra */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Preço de Compra (Custo)</label>
          <input name="custo" type="number" step="0.01" defaultValue={editando?.precoCusto} placeholder="Ex: 80.00" className="border p-2 rounded border-red-300 focus:border-red-500 outline-none" required />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Preço de Venda</label>
          <input name="preco" type="number" step="0.01" defaultValue={editando?.preco} placeholder="Ex: 150.00" className="border p-2 rounded border-emerald-300 focus:border-emerald-500 outline-none" required />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Alerta Mínimo (Un)</label>
          <input name="alerta" type="number" defaultValue={editando?.alertaMinimo} placeholder="Ex: 5" className="border p-2 rounded" required />
        </div>
        
        <button className="col-span-2 md:col-span-3 bg-emerald-600 text-white py-2 font-bold rounded hover:bg-emerald-700 transition">
          {editando ? 'Salvar Edição' : 'Adicionar ao Estoque'}
        </button>
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
          {produtos.map((p: any) => {
            const garrafasFechadas = Math.trunc(p.qtd);
            const volumeTotalML = p.mlPorGarrafa > 0 ? Math.round(p.qtd * p.mlPorGarrafa) : 0;
            const estoqueZeradoOuNegativo = p.qtd <= 0;

            return (
              <tr key={p.nome} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">
                  {p.nome} <br/>
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
                  <button onClick={() => setProdutos(produtos.filter((x:any) => x.nome !== p.nome))} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Excluir</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}