import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ItemPedido, Produto, Receita } from '../types';
import { calcularConsumoDoCarrinho, calcularTotalEstimado, encontrarEstoqueInsuficiente } from '../lib/businessRules';

type ItemCatalogo = Produto | Receita;

const LIMITE_POR_ITEM = 99;
const LIMITE_TOTAL = 200;

const ehReceita = (item: ItemCatalogo): item is Receita => 'ingredientes' in item;
const tipoDoItem = (item: ItemCatalogo): ItemPedido['tipo'] => (ehReceita(item) ? 'receita' : 'produto');

export function Pdv() {
  const { produtos, receitas, vendas, registrarPedido, notificacoes, setNotificacoes, adicionarNotificacao } = useApp();
  const [iniciandoVenda, setIniciandoVenda] = useState(false);
  const [busca, setBusca] = useState('');
  const [processando, setProcessando] = useState(false);
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  // Identifica este pedido para o servidor: reenviar o mesmo carrinho nunca duplica a venda.
  // Qualquer mudança no carrinho gera um novo identificador.
  const [pedidoId, setPedidoId] = useState(() => crypto.randomUUID());

  const alterarCarrinho = (novo: ItemPedido[]) => {
    setCarrinho(novo);
    setPedidoId(crypto.randomUUID());
  };

  const totalUnidades = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  const adicionar = (item: ItemCatalogo) => {
    const tipo = tipoDoItem(item);
    const existente = carrinho.find((c) => c.tipo === tipo && c.id === item.id);
    if (totalUnidades >= LIMITE_TOTAL || (existente && existente.quantidade >= LIMITE_POR_ITEM)) {
      adicionarNotificacao(`Limite do pedido atingido (${LIMITE_POR_ITEM} por item, ${LIMITE_TOTAL} no total).`, 'aviso');
      return;
    }
    if (existente) {
      alterarCarrinho(carrinho.map((c) => (c === existente ? { ...c, quantidade: c.quantidade + 1 } : c)));
    } else {
      alterarCarrinho([...carrinho, { tipo, id: item.id, quantidade: 1 }]);
    }
  };

  const remover = (alvo: ItemPedido) => alterarCarrinho(carrinho.filter((c) => c !== alvo));

  const alterarQuantidade = (alvo: ItemPedido, delta: number) => {
    const quantidade = alvo.quantidade + delta;
    if (quantidade < 1) {
      remover(alvo);
      return;
    }
    if (quantidade > LIMITE_POR_ITEM || totalUnidades + delta > LIMITE_TOTAL) return;
    alterarCarrinho(carrinho.map((c) => (c === alvo ? { ...c, quantidade } : c)));
  };

  const buscarItem = (c: ItemPedido): ItemCatalogo | undefined =>
    c.tipo === 'receita' ? receitas.find((r) => r.id === c.id) : produtos.find((p) => p.id === c.id);

  // Avisos de estoque são só orientação na tela; o servidor confere de novo ao finalizar.
  const consumo = calcularConsumoDoCarrinho(carrinho, produtos, receitas);
  const itemSemEstoque = consumo ? encontrarEstoqueInsuficiente(consumo, produtos) : null;
  const carrinhoInvalido = carrinho.length > 0 && (consumo === null || itemSemEstoque !== null);
  const totalEstimado = calcularTotalEstimado(carrinho, produtos, receitas);

  const finalizarVenda = async () => {
    if (processando || carrinho.length === 0 || carrinhoInvalido) return; // evita clique duplo enquanto salva
    setProcessando(true);
    const registradas = await registrarPedido(carrinho, pedidoId);
    if (registradas) {
      const total = registradas.reduce((acc, venda) => acc + venda.preco, 0);
      adicionarNotificacao(`Venda registrada: ${registradas.length} item(ns) — R$ ${total.toFixed(2)}`, 'sucesso');
      setCarrinho([]);
      setPedidoId(crypto.randomUUID());
      setIniciandoVenda(false);
      setBusca('');
    }
    setProcessando(false);
  };

  const itensDisponiveis: ItemCatalogo[] = [...produtos, ...receitas];

  return (
    <div className="p-3 md:p-6 lg:p-8 relative bg-adega-bg text-adega-text min-h-full transition-colors">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[90%] md:w-full mx-auto">
        {notificacoes.map((n) => (
          <div
            key={n.id}
            role="status"
            onClick={() => setNotificacoes(notificacoes.filter((x) => x.id !== n.id))}
            className={`p-4 rounded-2xl shadow-xl text-white flex justify-between items-center transition-all cursor-pointer ${n.tipo === 'erro' ? 'bg-red-600 border-l-4 border-red-800' : n.tipo === 'sucesso' ? 'bg-emerald-600 border-l-4 border-emerald-800' : 'bg-amber-500 border-l-4 border-amber-700'}`}
          >
            <span className="font-medium text-sm">{n.mensagem}</span>
            <button aria-label="Fechar aviso" onClick={(event) => { event.stopPropagation(); setNotificacoes(notificacoes.filter((x) => x.id !== n.id)); }} className="ml-4 font-bold">OK</button>
          </div>
        ))}
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-6 text-adega-text">Ponto de Venda (PDV)</h2>

      <button
        onClick={() => setIniciandoVenda(!iniciandoVenda)}
        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold mb-6 w-full md:w-auto hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
      >
        {iniciandoVenda ? 'Fechar Seleção' : carrinho.length > 0 ? 'Adicionar mais itens' : 'Nova Venda'}
      </button>

      {iniciandoVenda && (
        <div className="bg-adega-card border border-adega-border p-4 md:p-6 rounded-3xl shadow-sm mb-8">
          <input
            placeholder="Buscar produto ou receita..."
            className="border border-adega-border focus:border-emerald-500 p-3.5 w-full mb-4 rounded-2xl bg-adega-bg text-adega-text placeholder-adega-muted outline-none transition"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {itensDisponiveis
              .filter((i) => i.nome?.toLowerCase().includes(busca.toLowerCase()))
              .map((item) => (
                <button
                  key={`${tipoDoItem(item)}-${item.id}`}
                  disabled={processando}
                  onClick={() => adicionar(item)}
                  className="bg-adega-bg border border-adega-border p-4 rounded-2xl hover:border-emerald-500 hover:bg-adega-border/30 text-left transition flex flex-col justify-between group shadow-sm disabled:opacity-50"
                >
                  <p className="font-bold text-adega-text group-hover:text-emerald-500 transition">{item.nome}</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-2">R$ {Number(item.preco || 0).toFixed(2)}</p>
                </button>
              ))}
          </div>
        </div>
      )}

      {carrinho.length > 0 && (
        <div className="bg-adega-card border border-adega-border p-4 md:p-6 rounded-3xl shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-adega-text">Carrinho ({totalUnidades} {totalUnidades === 1 ? 'item' : 'itens'})</h3>
            <button
              disabled={processando}
              onClick={() => alterarCarrinho([])}
              className="text-sm text-adega-muted hover:text-red-500 transition disabled:opacity-50"
            >
              Limpar
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {carrinho.map((c) => {
              const item = buscarItem(c);
              return (
                <div key={`${c.tipo}-${c.id}`} className="flex items-center justify-between gap-3 border-b border-adega-border pb-2">
                  <div className="min-w-0">
                    <p className="font-bold text-adega-text truncate">{item?.nome ?? 'Item indisponível'}</p>
                    <p className="text-xs text-adega-muted">R$ {Number(item?.preco ?? 0).toFixed(2)} cada</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label={`Diminuir quantidade de ${item?.nome ?? 'item'}`}
                      disabled={processando}
                      onClick={() => alterarQuantidade(c, -1)}
                      className="w-8 h-8 rounded-full border border-adega-border font-bold hover:border-emerald-500 transition disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-adega-text" aria-live="polite">{c.quantidade}</span>
                    <button
                      aria-label={`Aumentar quantidade de ${item?.nome ?? 'item'}`}
                      disabled={processando}
                      onClick={() => alterarQuantidade(c, 1)}
                      className="w-8 h-8 rounded-full border border-adega-border font-bold hover:border-emerald-500 transition disabled:opacity-50"
                    >
                      +
                    </button>
                    <button
                      aria-label={`Remover ${item?.nome ?? 'item'} do carrinho`}
                      disabled={processando}
                      onClick={() => remover(c)}
                      className="ml-2 text-sm text-adega-muted hover:text-red-500 transition disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {carrinhoInvalido && (
            <p role="alert" className="text-sm text-red-500 mb-3">
              {itemSemEstoque
                ? `Estoque insuficiente de "${itemSemEstoque.nome}" para este carrinho.`
                : 'Há um item ou ingrediente do carrinho que não existe mais. Atualize a página.'}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-adega-muted">Total estimado (o valor final é confirmado pelo servidor)</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">R$ {totalEstimado.toFixed(2)}</p>
            </div>
            <button
              disabled={processando || carrinhoInvalido}
              onClick={finalizarVenda}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {processando ? 'Registrando...' : 'Finalizar venda'}
            </button>
          </div>
        </div>
      )}

      <h3 className="font-bold mb-3 text-adega-text">Vendas Recentes:</h3>
      <div className="bg-adega-card border border-adega-border rounded-3xl p-4 md:p-6 shadow-sm max-h-96 overflow-y-auto">
        {vendas.length === 0 ? (
          <p className="text-adega-muted italic text-center py-6 text-sm">Nenhuma venda realizada recentemente.</p>
        ) : (
          vendas.slice().reverse().map((v) => (
            <div key={v.id} className="border-b border-adega-border py-3.5 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-adega-bg/50 px-2 rounded-2xl transition gap-2">
              <div>
                <span className="text-xs text-adega-muted mr-3">{v.data}</span>
                <span className="font-bold text-adega-text">{v.nome}</span>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">R$ {Number(v.preco || 0).toFixed(2)}</p>
                <p className="text-xs text-adega-muted">Lucro: R$ {Number(v.lucro || 0).toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
