import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function Pdv() {
  const { produtos, receitas, vendas, setVendas, darBaixa, notificacoes, setNotificacoes } = useApp();
  const [iniciandoVenda, setIniciandoVenda] = useState(false);
  const [busca, setBusca] = useState('');

  const registrarVenda = (item: any) => {
    let custoDoItem = item.precoCusto || 0;

    // Se for uma receita, calcula o custo baseado na proporção dos ingredientes usados
    if (item.ingredientes) {
      item.ingredientes.forEach((ing: any) => darBaixa(ing.nome, ing.tipo, ing.qtd));
      
      custoDoItem = item.ingredientes.reduce((acc: number, ing: any) => {
        const prodBd = produtos.find((p: any) => p.nome === ing.nome);
        if (prodBd) {
          if (ing.tipo === 'ML' && prodBd.mlPorGarrafa > 0) {
            return acc + (Number(prodBd.precoCusto) / Number(prodBd.mlPorGarrafa)) * Number(ing.qtd);
          }
          return acc + (Number(prodBd.precoCusto) * Number(ing.qtd));
        }
        return acc;
      }, 0);
    } else {
      darBaixa(item.nome, item.tipo || 'Unidade', 1);
    }
    
    // Garantindo que o preço seja tratado como número
    const precoVenda = Number(item.preco || 0);

    const novaVenda = { 
      nome: item.nome, 
      preco: precoVenda, 
      custo: custoDoItem, 
      lucro: precoVenda - custoDoItem, 
      data: new Date().toLocaleTimeString(), 
      dataHoraISO: new Date().toISOString()
    };
    
    setVendas([...vendas, novaVenda]);
    setIniciandoVenda(false);
    setBusca('');
  };

  return (
    <div className="p-8 relative">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {notificacoes.map((n: any) => (
          <div key={n.id} className={`p-4 rounded shadow-xl text-white flex justify-between items-center transition-all ${n.tipo === 'erro' ? 'bg-red-600' : 'bg-amber-500'}`}>
            <span className="font-medium text-sm">{n.mensagem}</span>
            <button onClick={() => setNotificacoes(notificacoes.filter((x: any) => x.id !== n.id))} className="ml-4 font-bold">✕</button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6">Ponto de Venda (PDV)</h2>

      <button 
        onClick={() => setIniciandoVenda(!iniciandoVenda)}
        className="bg-emerald-600 text-white px-6 py-3 rounded font-bold mb-6 w-full md:w-auto hover:bg-emerald-700 transition shadow-lg"
      >
        {iniciandoVenda ? 'Cancelar Seleção' : 'Nova Venda'}
      </button>

      {iniciandoVenda && (
        <div className="bg-white p-6 border rounded shadow-lg mb-8">
          <input 
            placeholder="Buscar produto ou receita..." 
            className="border-2 border-emerald-100 focus:border-emerald-500 p-3 w-full mb-4 rounded outline-none" 
            onChange={(e) => setBusca(e.target.value)} 
            autoFocus
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...produtos, ...receitas]
              .filter(i => i.nome?.toLowerCase().includes(busca.toLowerCase()))
              .map((item, index) => (
                <button 
                  key={index} 
                  onClick={() => registrarVenda(item)} 
                  className="bg-white border-2 border-gray-100 p-4 rounded hover:border-emerald-500 hover:bg-emerald-50 text-left transition"
                >
                  <p className="font-bold text-gray-800">{item.nome}</p>
                  {/* BLINDAGEM: Usando Number() antes do toFixed */}
                  <p className="text-emerald-600 font-bold mt-1">R$ {Number(item.preco || 0).toFixed(2)}</p>
                </button>
            ))}
          </div>
        </div>
      )}

      <h3 className="font-bold mb-2 text-gray-700">Vendas Recentes:</h3>
      <div className="bg-white border rounded p-4 h-64 overflow-y-auto shadow-sm">
        {vendas.slice().reverse().map((v: any, i: number) => (
          <div key={i} className="border-b py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded">
            <div>
              <span className="text-sm text-gray-500 mr-2">{v.data}</span>
              <span className="font-bold">{v.nome}</span>
            </div>
            <div className="text-right">
              {/* BLINDAGEM: Usando Number() antes do toFixed */}
              <p className="text-emerald-600 font-bold">R$ {Number(v.preco || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">Lucro: R$ {Number(v.lucro || 0).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}