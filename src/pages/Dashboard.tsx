import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Venda } from '../types';

interface DadoAgrupado {
  label: string;
  valor: number;
  lucro: number;
  itens: Venda[];
}

export function Dashboard() {
  const { vendas } = useApp();
  const [filtro, setFiltro] = useState<'diario' | 'semanal' | 'mensal'>('diario');
  const [detalhesSelecionados, setDetalhesSelecionados] = useState<DadoAgrupado | null>(null);
  
  // Estado para escolher o mês na visualização mensal (Padrão: mês atual de 2026)
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());

  const mesesAno = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const { chartData, totalVendido, lucroTotal } = useMemo(() => {
    let dadosAgrupados: DadoAgrupado[] = [];
    const agora = new Date();
    const vendasValidas = vendas.filter((v) => v.dataHoraISO);

    if (filtro === 'diario') {
      const labels = Array.from({ length: 24 }, (_, i) => `${i}h`);
      dadosAgrupados = labels.map(label => ({ label, valor: 0, lucro: 0, itens: [] }));
      
      vendasValidas.forEach((v) => {
        const d = new Date(v.dataHoraISO);
        if (d.toDateString() === agora.toDateString()) {
          const hora = d.getHours();
          dadosAgrupados[hora].valor += Number(v.preco || 0);
          dadosAgrupados[hora].lucro += Number(v.lucro || 0);
          dadosAgrupados[hora].itens.push(v);
        }
      });
    } 
    else if (filtro === 'semanal') {
      const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      dadosAgrupados = labels.map(label => ({ label, valor: 0, lucro: 0, itens: [] }));
      
      const inicioSemana = new Date(agora);
      inicioSemana.setDate(agora.getDate() - agora.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      vendasValidas.forEach((v) => {
        const d = new Date(v.dataHoraISO);
        if (d >= inicioSemana && d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear()) {
          const dia = d.getDay();
          dadosAgrupados[dia].valor += Number(v.preco || 0);
          dadosAgrupados[dia].lucro += Number(v.lucro || 0);
          dadosAgrupados[dia].itens.push(v);
        }
      });
    } 
    else if (filtro === 'mensal') {
      const labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
      dadosAgrupados = labels.map(label => ({ label, valor: 0, lucro: 0, itens: [] }));
      
      vendasValidas.forEach((v) => {
        const d = new Date(v.dataHoraISO);
        // Filtra pelo mês escolhido pelo usuário no <select>
        if (d.getMonth() === Number(mesSelecionado) && d.getFullYear() === agora.getFullYear()) {
          const dia = d.getDate();
          let sem: number;
          if (dia <= 7) sem = 0;
          else if (dia <= 14) sem = 1;
          else if (dia <= 21) sem = 2;
          else sem = 3;

          dadosAgrupados[sem].valor += Number(v.preco || 0);
          dadosAgrupados[sem].lucro += Number(v.lucro || 0);
          dadosAgrupados[sem].itens.push(v);
        }
      });
    }

    const tVendido = dadosAgrupados.reduce((acc, curr) => acc + curr.valor, 0);
    const lTotal = dadosAgrupados.reduce((acc, curr) => acc + curr.lucro, 0);

    return { chartData: dadosAgrupados, totalVendido: tVendido, lucroTotal: lTotal };
  }, [vendas, filtro, mesSelecionado]);

  const maxBarValue = Math.max(...chartData.map(d => d.valor), 1);

  return (
    <div className="p-3 md:p-6 lg:p-8">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">Dashboard de Vendas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-4 md:p-6 rounded shadow-sm border-l-4 border-blue-500 flex flex-col justify-center">
          <p className="text-gray-500 text-xs md:text-sm font-bold uppercase">Faturamento (Vendas)</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600">R$ {totalVendido.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded shadow-sm border-l-4 border-emerald-500 flex flex-col justify-center">
          <p className="text-gray-500 text-xs md:text-sm font-bold uppercase">Lucro Líquido</p>
          <p className="text-2xl md:text-3xl font-bold text-emerald-600">R$ {lucroTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border mb-6">
        <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          {['diario', 'semanal', 'mensal'].map((f) => (
            <button
              key={f}
              onClick={() => { setFiltro(f as 'diario' | 'semanal' | 'mensal'); setDetalhesSelecionados(null); }}
              className={`flex-1 md:flex-none px-4 py-2 rounded font-bold capitalize transition text-sm md:text-base ${filtro === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Seletor dinâmico de mês exclusivo para o filtro mensal */}
        {filtro === 'mensal' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
            <label className="text-sm font-bold text-gray-600">Analisar o Mês de:</label>
            <select 
              value={mesSelecionado} 
              onChange={(e) => { setMesSelecionado(Number(e.target.value)); setDetalhesSelecionados(null); }}
              className="border p-2 rounded font-medium bg-white outline-none focus:border-gray-800 w-full sm:w-auto"
            >
              {mesesAno.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white p-4 md:p-6 rounded shadow-sm border mb-8 overflow-x-auto">
        <h3 className="font-bold text-gray-700 mb-8 capitalize">
          Visualização {filtro === 'mensal' ? `${filtro} (${mesesAno[mesSelecionado]})` : filtro}
        </h3>
        
        <div className="h-64 flex items-end gap-1 md:gap-2 min-w-[500px]">
          {chartData.map((d, index) => {
            const alturaPercentual = (d.valor / maxBarValue) * 100;
            return (
              <div key={index} onClick={() => setDetalhesSelecionados(d)} className="relative group flex-1 flex flex-col justify-end h-full cursor-pointer">
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded p-2 pointer-events-none transition-opacity z-10 w-max text-center shadow-lg">
                  <p className="font-bold mb-1">{d.label}</p>
                  <p>Vendido: R$ {d.valor.toFixed(2)}</p>
                  <p className="text-emerald-400 font-bold">Lucro: R$ {d.lucro.toFixed(2)}</p>
                  <p className="text-gray-400 mt-1 text-[10px] italic">Clique para ver os {d.itens.length} itens</p>
                </div>

                <div style={{ height: `${alturaPercentual}%`, minHeight: d.valor > 0 ? '4px' : '0' }} className="w-full bg-blue-500 hover:bg-blue-400 rounded-t transition-all duration-300 relative">
                  {d.valor > 0 && (
                    <div style={{ height: `${(d.lucro / d.valor) * 100}%` }} className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-t" />
                  )}
                </div>
                <span className="text-[10px] md:text-xs text-center mt-2 text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {detalhesSelecionados && (
        <div className="bg-white p-4 md:p-6 rounded shadow-sm border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="font-bold text-lg text-gray-800">Produtos vendidos: {detalhesSelecionados.label}</h3>
            <button onClick={() => setDetalhesSelecionados(null)} className="text-gray-400 hover:text-red-500 font-bold text-sm">FECHAR ✕</button>
          </div>
          {detalhesSelecionados.itens.length === 0 ? (
            <p className="text-gray-500 italic">Nenhuma venda registrada neste período.</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-3">Horário</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Custo</th>
                    <th className="p-3">Vendido Por</th>
                    <th className="p-3 text-emerald-600">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhesSelecionados.itens.map((item, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-3 text-gray-500">{new Date(item.dataHoraISO).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="p-3 font-medium text-gray-800">{item.nome}</td>
                      <td className="p-3 text-red-500">R$ {Number(item.custo || 0).toFixed(2)}</td>
                      <td className="p-3 font-bold text-gray-700">R$ {Number(item.preco || 0).toFixed(2)}</td>
                      <td className="p-3 font-bold text-emerald-600">R$ {Number(item.lucro || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}