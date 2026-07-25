import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function Relatorios() {
  const { vendas, produtos } = useApp();

  // 1. Estados temporários para os campos de input (O que o usuário está digitando)
  const [inputInicio, setInputInicio] = useState('');
  const [inputFim, setInputFim] = useState('');
  const [inputBusca, setInputBusca] = useState('');

  // 2. Estados reais dos filtros (Só atualizam quando clica em Pesquisar)
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<'historico' | 'analise'>('historico');

  // Função disparada ao clicar no botão de Pesquisar
  const lidarComPesquisa = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltroInicio(inputInicio);
    setFiltroFim(inputFim);
    setFiltroBusca(inputBusca);
  };

  const limparFiltros = () => {
    setInputInicio('');
    setInputFim('');
    setInputBusca('');
    setFiltroInicio('');
    setFiltroFim('');
    setFiltroBusca('');
  };

  // Lógica pesada memorizada: Filtra as vendas com base nos controles APLICADOS
  const vendasFiltradas = useMemo(() => {
    const agora = new Date();

    return vendas.filter((v: any) => {
      if (!v.dataHoraISO) return false; // Ignora vendas antigas sem data

      const dataVenda = new Date(v.dataHoraISO);

      // REGRA DO MÊS ATUAL: Se não há datas informadas, mostra o Mês Atual por padrão
      if (!filtroInicio && !filtroFim) {
        const mesmoMes = dataVenda.getMonth() === agora.getMonth();
        const mesmoAno = dataVenda.getFullYear() === agora.getFullYear();
        const passaNomePadrao = filtroBusca ? v.nome.toLowerCase().includes(filtroBusca.toLowerCase()) : true;
        return mesmoMes && mesmoAno && passaNomePadrao;
      }

      // Ajuste de fuso horário garantindo o dia correto
      const dInicio = filtroInicio ? new Date(filtroInicio + 'T00:00:00') : null;
      const dFim = filtroFim ? new Date(filtroFim + 'T23:59:59') : null;

      const passaInicio = dInicio ? dataVenda >= dInicio : true;
      const passaFim = dFim ? dataVenda <= dFim : true;
      const passaNome = filtroBusca ? v.nome.toLowerCase().includes(filtroBusca.toLowerCase()) : true;

      return passaInicio && passaFim && passaNome;
    });
  }, [vendas, filtroInicio, filtroFim, filtroBusca]);

  // Cálculo dos totais do período com blindagem numérica
  const totais = useMemo(() => {
    return vendasFiltradas.reduce((acc: { faturamento: number, custo: number, lucro: number, qtd: number }, curr: any) => {
      acc.faturamento += Number(curr.preco || 0);
      acc.custo += Number(curr.custo || 0);
      acc.lucro += Number(curr.lucro || 0);
      acc.qtd += 1;
      return acc;
    }, { faturamento: 0, custo: 0, lucro: 0, qtd: 0 });
  }, [vendasFiltradas]);

  // Curva ABC e Produtos Parados
  const { rankingProdutos, produtosParados } = useMemo(() => {
    const mapa: Record<string, { qtd: number, lucro: number, faturamento: number }> = {};

    // Agrupa as vendas por produto
    vendasFiltradas.forEach((v: any) => {
      if (!mapa[v.nome]) {
        mapa[v.nome] = { qtd: 0, lucro: 0, faturamento: 0 };
      }
      mapa[v.nome].qtd += 1;
      mapa[v.nome].lucro += Number(v.lucro || 0);
      mapa[v.nome].faturamento += Number(v.preco || 0);
    });

    // Converte para array e ordena por lucro (Os que dão mais dinheiro no topo)
    const ranking = Object.keys(mapa)
      .map(nome => ({ nome, ...mapa[nome] }))
      .sort((a, b) => b.lucro - a.lucro);

    // Encontra produtos do estoque que NÃO tiveram saída neste período
    const nomesVendidos = Object.keys(mapa);
    const parados = produtos.filter((p: any) => !nomesVendidos.includes(p.nome));

    return { rankingProdutos: ranking, produtosParados: parados };
  }, [vendasFiltradas, produtos]);

  // Função para Exportar Excel (CSV)
  const exportarCSV = () => {
    const cabecalho = "Data,Produto,Custo,Vendido Por,Lucro\n";
    const linhas = vendasFiltradas.map((v: any) => {
      const dataFormatada = new Date(v.dataHoraISO).toLocaleString();
      return `"${dataFormatada}","${v.nome}",${Number(v.custo || 0).toFixed(2)},${Number(v.preco || 0).toFixed(2)},${Number(v.lucro || 0).toFixed(2)}`;
    }).join("\n");

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_adega_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para Imprimir/PDF
  const exportarPDF = () => {
    window.print();
  };

  return (
    <div className="p-3 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Cabeçalho que aparece na impressão */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Relatório Financeiro e Estoque</h1>
        <p className="text-gray-500">Gerado em: {new Date().toLocaleString()}</p>
        <p className="font-medium mt-2">
          Período:{' '}
          {filtroInicio || filtroFim
            ? `${filtroInicio ? new Date(filtroInicio + 'T00:00:00').toLocaleDateString() : 'Sempre'} até ${filtroFim ? new Date(filtroFim + 'T00:00:00').toLocaleDateString() : 'Hoje'}`
            : 'Mês Atual'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Central de Relatórios</h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={exportarCSV} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition shadow-sm text-sm md:text-base">
            Baixar Excel
          </button>
          <button onClick={exportarPDF} className="flex-1 md:flex-none bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded font-bold transition shadow-sm text-sm md:text-base">
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Formulário de Filtros - Oculto na Impressão */}
      <form onSubmit={lidarComPesquisa} className="bg-white p-4 md:p-6 rounded shadow-sm border mb-8 print:hidden">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Filtros Personalizados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Data Inicial</label>
            <input type="date" value={inputInicio} onChange={(e) => setInputInicio(e.target.value)} className="border p-2 rounded outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Data Final</label>
            <input type="date" value={inputFim} onChange={(e) => setInputFim(e.target.value)} className="border p-2 rounded outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Buscar por Produto</label>
            <input type="text" value={inputBusca} onChange={(e) => setInputBusca(e.target.value)} placeholder="Ex: Combo..." className="border p-2 rounded outline-none focus:border-blue-500" />
          </div>

          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 md:p-2.5 rounded font-bold transition shadow-sm w-full">
            Pesquisar
          </button>
        </div>

        {(filtroInicio || filtroFim || filtroBusca) && (
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={limparFiltros} className="text-sm text-red-500 font-bold hover:underline">
              Limpar Filtros e Voltar ao Mês Atual
            </button>
          </div>
        )}
      </form>

      {/* Cartões de Resumo do Período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded border shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Itens Vendidos</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{totais.qtd} un</p>
        </div>
        <div className="bg-white p-4 rounded border shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Custo Total</p>
          <p className="text-xl md:text-2xl font-bold text-red-600">R$ {totais.custo.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded border shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Faturamento Bruto</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600">R$ {totais.faturamento.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded border shadow-sm border-b-4 border-emerald-500">
          <p className="text-xs font-bold text-gray-500 uppercase">Lucro Limpo</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-600">R$ {totais.lucro.toFixed(2)}</p>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex flex-wrap gap-2 md:gap-4 border-b mb-6 print:hidden">
        <button
          onClick={() => setAbaAtiva('historico')}
          className={`pb-2 px-2 md:px-4 font-bold transition-all text-sm md:text-base ${abaAtiva === 'historico' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Histórico Detalhado
        </button>
        <button
          onClick={() => setAbaAtiva('analise')}
          className={`pb-2 px-2 md:px-4 font-bold transition-all text-sm md:text-base ${abaAtiva === 'analise' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Curva ABC & Estoque Parado
        </button>
      </div>

      {/* Tabela de Histórico */}
      <div className={`${abaAtiva === 'historico' ? 'block' : 'hidden'} print:block mb-8`}>
        <div className="bg-white border rounded shadow-sm overflow-hidden w-full">
          <div className="p-4 bg-gray-50 border-b print:bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-bold text-gray-800">
              Listagem de Vendas ({filtroInicio || filtroFim ? 'Período Selecionado' : 'Mês Atual'})
            </h3>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{vendasFiltradas.length} registros</span>
          </div>

          <div className="w-full overflow-x-auto max-h-96 print:max-h-none print:overflow-visible">
            {vendasFiltradas.length === 0 ? (
              <p className="p-6 text-center text-gray-500 italic">Nenhum registro encontrado para este filtro.</p>
            ) : (
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10 print:static">
                  <tr>
                    <th className="p-3 whitespace-nowrap">Data e Hora</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Custo</th>
                    <th className="p-3">Valor de Venda</th>
                    <th className="p-3">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vendasFiltradas.slice().reverse().map((v: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(v.dataHoraISO).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="p-3 font-medium text-gray-800">{v.nome}</td>
                      <td className="p-3 text-red-500">R$ {Number(v.custo || 0).toFixed(2)}</td>
                      <td className="p-3 font-medium">R$ {Number(v.preco || 0).toFixed(2)}</td>
                      <td className="p-3 font-bold text-emerald-600">R$ {Number(v.lucro || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Análise ABC e Produtos Parados */}
      <div className={`${abaAtiva === 'analise' ? 'block' : 'hidden'} print:block grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6`}>

        {/* Curva ABC - Mais Vendidos */}
        <div className="bg-white border rounded shadow-sm w-full overflow-hidden">
          <div className="p-4 bg-gray-50 border-b print:bg-white">
            <h3 className="font-bold text-gray-800">Curva ABC (Top Lucro)</h3>
            <p className="text-xs text-gray-500">Produtos que mais geraram retorno no período</p>
          </div>
          <div className="p-4">
            {rankingProdutos.length === 0 ? (
              <p className="text-center text-gray-500 italic text-sm">Sem dados suficientes.</p>
            ) : (
              <div className="space-y-3">
                {rankingProdutos.map((item, index) => (
                  <div key={item.nome} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-3">
                      <span className={`min-w-[24px] h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-800 text-sm md:text-base">{item.nome}</p>
                        <p className="text-xs text-gray-500">{item.qtd} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap ml-2">
                      <p className="font-bold text-emerald-600 text-sm md:text-base">R$ {Number(item.lucro).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 uppercase">LUCRO</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estoque Parado */}
        <div className="bg-white border rounded shadow-sm w-full overflow-hidden">
          <div className="p-4 bg-red-50 border-b print:bg-white print:border-b-2 print:border-red-500">
            <h3 className="font-bold text-red-800">Alerta de Estoque Parado</h3>
            <p className="text-xs text-red-600">Produtos com ZERO saídas no período</p>
          </div>
          <div className="p-4">
            {produtosParados.length === 0 ? (
              <p className="text-center text-emerald-600 font-bold text-sm">Excelente! Todos os produtos tiveram saída.</p>
            ) : (
              <div className="space-y-3">
                {produtosParados.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-bold text-gray-800 text-sm md:text-base">{item.nome}</p>
                      <p className="text-xs text-gray-500">{item.qtd} unidades presas no estoque</p>
                    </div>
                    <div className="text-right whitespace-nowrap ml-2">
                      <p className="font-medium text-red-600 text-sm md:text-base">R$ {Number(item.precoCusto || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 uppercase">Custo / Un</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}