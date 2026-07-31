import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Venda, Produto } from '../types';

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

    return vendas.filter((v: Venda) => {
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
    return vendasFiltradas.reduce((acc: { faturamento: number, custo: number, lucro: number, qtd: number }, curr: Venda) => {
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
    vendasFiltradas.forEach((v: Venda) => {
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
    const parados = produtos.filter((p: Produto) => !nomesVendidos.includes(p.nome));

    return { rankingProdutos: ranking, produtosParados: parados };
  }, [vendasFiltradas, produtos]);

  // Função para Exportar Excel (CSV)
  const exportarCSV = () => {
    const cabecalho = "Data,Produto,Custo,Vendido Por,Lucro\n";
    const linhas = vendasFiltradas.map((v: Venda) => {
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
    <div className="p-3 md:p-6 lg:p-8 bg-adega-bg text-adega-text min-h-screen transition-colors">
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
        <h2 className="text-xl md:text-2xl font-bold text-adega-text">Central de Relatórios</h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={exportarCSV} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition shadow-sm text-sm md:text-base">
            Baixar Excel
          </button>
          <button onClick={exportarPDF} className="flex-1 md:flex-none bg-adega-card border border-adega-border hover:bg-adega-border/50 text-adega-text px-4 py-2 rounded-xl font-bold transition shadow-sm text-sm md:text-base">
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Formulário de Filtros - Oculto na Impressão */}
      <form onSubmit={lidarComPesquisa} className="bg-adega-card border border-adega-border p-4 md:p-6 rounded-3xl shadow-sm mb-8 print:hidden">
        <h3 className="text-xs font-bold text-adega-muted uppercase tracking-wider mb-4">Filtros Personalizados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-adega-muted">Data Inicial</label>
            <input type="date" value={inputInicio} onChange={(e) => setInputInicio(e.target.value)} className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-adega-muted">Data Final</label>
            <input type="date" value={inputFim} onChange={(e) => setInputFim(e.target.value)} className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-adega-muted">Buscar por Produto</label>
            <input type="text" value={inputBusca} onChange={(e) => setInputBusca(e.target.value)} placeholder="Ex: Combo..." className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted outline-none focus:border-blue-500" />
          </div>

          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold transition shadow-md shadow-emerald-600/25 w-full">
            Pesquisar
          </button>
        </div>

        {(filtroInicio || filtroFim || filtroBusca) && (
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={limparFiltros} className="text-xs text-red-500 font-bold hover:underline">
              Limpar Filtros e Voltar ao Mês Atual
            </button>
          </div>
        )}
      </form>

      {/* Cartões de Resumo do Período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-adega-card border border-adega-border p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-adega-muted uppercase">Itens Vendidos</p>
          <p className="text-xl md:text-2xl font-bold text-adega-text mt-1">{totais.qtd} un</p>
        </div>
        <div className="bg-adega-card border border-adega-border p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-adega-muted uppercase">Custo Total</p>
          <p className="text-xl md:text-2xl font-bold text-red-500 mt-1">R$ {totais.custo.toFixed(2)}</p>
        </div>
        <div className="bg-adega-card border border-adega-border p-5 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-adega-muted uppercase">Faturamento Bruto</p>
          <p className="text-xl md:text-2xl font-bold text-blue-500 mt-1">R$ {totais.faturamento.toFixed(2)}</p>
        </div>
        <div className="bg-adega-card border border-adega-border p-5 rounded-2xl shadow-sm border-b-4 border-emerald-500">
          <p className="text-[11px] font-bold text-adega-muted uppercase">Lucro Limpo</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-500 mt-1">R$ {totais.lucro.toFixed(2)}</p>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex flex-wrap gap-2 md:gap-4 border-b border-adega-border mb-6 print:hidden">
        <button
          onClick={() => setAbaAtiva('historico')}
          className={`pb-2 px-2 md:px-4 font-bold transition-all text-sm md:text-base ${abaAtiva === 'historico' ? 'border-b-2 border-adega-text text-adega-text' : 'text-adega-muted hover:text-adega-text'}`}
        >
          Histórico Detalhado
        </button>
        <button
          onClick={() => setAbaAtiva('analise')}
          className={`pb-2 px-2 md:px-4 font-bold transition-all text-sm md:text-base ${abaAtiva === 'analise' ? 'border-b-2 border-adega-text text-adega-text' : 'text-adega-muted hover:text-adega-text'}`}
        >
          Curva ABC & Estoque Parado
        </button>
      </div>

      {/* Tabela de Histórico */}
      <div className={`${abaAtiva === 'historico' ? 'block' : 'hidden'} print:block mb-8`}>
        <div className="bg-adega-card border border-adega-border rounded-3xl shadow-sm overflow-hidden w-full">
          <div className="p-4 md:p-6 bg-adega-bg border-b border-adega-border print:bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-bold text-adega-text">
              Listagem de Vendas ({filtroInicio || filtroFim ? 'Período Selecionado' : 'Mês Atual'})
            </h3>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl">{vendasFiltradas.length} registros</span>
          </div>

          <div className="w-full overflow-x-auto max-h-96 print:max-h-none print:overflow-visible">
            {vendasFiltradas.length === 0 ? (
              <p className="p-6 text-center text-adega-muted italic text-xs">Nenhum registro encontrado para este filtro.</p>
            ) : (
              <table className="w-full text-left text-sm min-w-[600px] border-collapse">
                <thead className="bg-adega-bg text-adega-muted sticky top-0 z-10 print:static border-b border-adega-border text-xs">
                  <tr>
                    <th className="p-4 whitespace-nowrap">Data e Hora</th>
                    <th className="p-4">Produto</th>
                    <th className="p-4">Custo</th>
                    <th className="p-4">Valor de Venda</th>
                    <th className="p-4">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adega-border">
                  {vendasFiltradas.slice().reverse().map((v: Venda, i: number) => (
                    <tr key={i} className="hover:bg-adega-bg/50 transition-colors">
                      <td className="p-4 text-adega-muted whitespace-nowrap text-xs">{new Date(v.dataHoraISO).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="p-4 font-medium text-adega-text">{v.nome}</td>
                      <td className="p-4 text-red-500">R$ {Number(v.custo || 0).toFixed(2)}</td>
                      <td className="p-4 font-medium text-adega-text">R$ {Number(v.preco || 0).toFixed(2)}</td>
                      <td className="p-4 font-bold text-emerald-500">R$ {Number(v.lucro || 0).toFixed(2)}</td>
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
        <div className="bg-adega-card border border-adega-border rounded-3xl shadow-sm w-full overflow-hidden">
          <div className="p-4 md:p-6 bg-adega-bg border-b border-adega-border print:bg-white">
            <h3 className="font-bold text-adega-text">Curva ABC (Top Lucro)</h3>
            <p className="text-xs text-adega-muted mt-0.5">Produtos que mais geraram retorno no período</p>
          </div>
          <div className="p-4 md:p-6">
            {rankingProdutos.length === 0 ? (
              <p className="text-center text-adega-muted italic text-xs">Sem dados suficientes.</p>
            ) : (
              <div className="space-y-3">
                {rankingProdutos.map((item, index) => (
                  <div key={item.nome} className="flex justify-between items-center border-b border-adega-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`min-w-[28px] h-7 flex items-center justify-center rounded-xl text-xs font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-500' : index === 1 ? 'bg-adega-border text-adega-text' : index === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-adega-bg text-adega-muted'}`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-adega-text text-sm md:text-base">{item.nome}</p>
                        <p className="text-xs text-adega-muted">{item.qtd} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap ml-2">
                      <p className="font-bold text-emerald-500 text-sm md:text-base">R$ {Number(item.lucro).toFixed(2)}</p>
                      <p className="text-[10px] text-adega-muted uppercase">LUCRO</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estoque Parado */}
        <div className="bg-adega-card border border-adega-border rounded-3xl shadow-sm w-full overflow-hidden">
          <div className="p-4 md:p-6 bg-red-500/10 border-b border-adega-border print:bg-white print:border-b-2 print:border-red-500">
            <h3 className="font-bold text-red-500">Alerta de Estoque Parado</h3>
            <p className="text-xs text-red-400 mt-0.5">Produtos com ZERO saídas no período</p>
          </div>
          <div className="p-4 md:p-6">
            {produtosParados.length === 0 ? (
              <p className="text-center text-emerald-500 font-bold text-xs py-4">Excelente! Todos os produtos tiveram saída.</p>
            ) : (
              <div className="space-y-3">
                {produtosParados.map((item: Produto, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b border-adega-border/50 pb-3">
                    <div>
                      <p className="font-bold text-adega-text text-sm md:text-base">{item.nome}</p>
                      <p className="text-xs text-adega-muted">{item.qtd} unidades presas no estoque</p>
                    </div>
                    <div className="text-right whitespace-nowrap ml-2">
                      <p className="font-medium text-red-500 text-sm md:text-base">R$ {Number(item.precoCusto || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-adega-muted uppercase">Custo / Un</p>
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