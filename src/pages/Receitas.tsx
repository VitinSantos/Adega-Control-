import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Ingrediente } from '../types';

interface ReceitaDraft {
  nome: string;
  preco: string;
  ingredientes: Ingrediente[];
  produtoSelecionadoId: string;
  tipoSelecionado: 'ML' | 'Unidade';
  qtdIngrediente: string;
}

const CHAVE_DRAFT = 'adegacontrol_receita_draft';

export function Receitas() {
  const {
    produtos,
    receitas,
    adicionarNotificacao,
    criarReceita,
    excluirReceita,
  } = useApp();

  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [tipoSelecionado, setTipoSelecionado] =
    useState<'ML' | 'Unidade'>('ML');
  const [qtdIngrediente, setQtdIngrediente] = useState('');

  /*
   * Restaura o rascunho salvo anteriormente.
   */
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_DRAFT);

      if (!salvo) return;

      const draft: ReceitaDraft = JSON.parse(salvo);

      setNome(draft.nome || '');
      setPreco(draft.preco || '');
      setIngredientes(draft.ingredientes || []);
      setProdutoSelecionadoId(draft.produtoSelecionadoId || '');
      setTipoSelecionado(draft.tipoSelecionado || 'ML');
      setQtdIngrediente(draft.qtdIngrediente || '');
    } catch (error) {
      console.error('Erro ao restaurar rascunho da receita:', error);
    }
  }, []);

  /*
   * Salva automaticamente o que está sendo preenchido.
   * Assim, se o usuário trocar de aba ou atualizar a página,
   * os dados continuam preenchidos.
   */
  useEffect(() => {
    const draft: ReceitaDraft = {
      nome,
      preco,
      ingredientes,
      produtoSelecionadoId,
      tipoSelecionado,
      qtdIngrediente,
    };

    const draftVazio: ReceitaDraft = {
      nome: '',
      preco: '',
      ingredientes: [],
      produtoSelecionadoId: '',
      tipoSelecionado: 'ML',
      qtdIngrediente: '',
    };

    const existeAlgumDado =
      draft.nome.trim() !== '' ||
      draft.preco.trim() !== '' ||
      draft.ingredientes.length > 0 ||
      draft.produtoSelecionadoId !== '' ||
      draft.qtdIngrediente.trim() !== '';

    const estaVazio =
      draft.nome === draftVazio.nome &&
      draft.preco === draftVazio.preco &&
      draft.ingredientes.length === 0 &&
      draft.produtoSelecionadoId === draftVazio.produtoSelecionadoId &&
      draft.tipoSelecionado === draftVazio.tipoSelecionado &&
      draft.qtdIngrediente === draftVazio.qtdIngrediente;

    if (existeAlgumDado && !estaVazio) {
      localStorage.setItem(CHAVE_DRAFT, JSON.stringify(draft));
    }
  }, [
    nome,
    preco,
    ingredientes,
    produtoSelecionadoId,
    tipoSelecionado,
    qtdIngrediente,
  ]);

  /*
   * Limpa completamente o rascunho.
   */
  const limparDraft = () => {
    localStorage.removeItem(CHAVE_DRAFT);

    setNome('');
    setPreco('');
    setIngredientes([]);
    setProdutoSelecionadoId('');
    setTipoSelecionado('ML');
    setQtdIngrediente('');
  };

  /*
   * Salva a receita.
   */
  const salvar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nome.trim()) {
      adicionarNotificacao(
        'Informe o nome da receita.',
        'erro'
      );
      return;
    }

    if (!preco || Number(preco) <= 0) {
      adicionarNotificacao(
        'Informe um preço válido para a receita.',
        'erro'
      );
      return;
    }

    if (ingredientes.length === 0) {
      adicionarNotificacao(
        'Adicione pelo menos um ingrediente!',
        'erro'
      );
      return;
    }

    setSalvando(true);

    const sucesso = await criarReceita({
      nome: nome.trim(),
      preco: Number(preco),
      ingredientes,
    });

    setSalvando(false);

    if (sucesso) {
      limparDraft();
    }
  };

  /*
   * Adiciona um ingrediente à receita.
   */
  const adicionarIngrediente = () => {
    const qtd = Number(qtdIngrediente);

    if (!produtoSelecionadoId) {
      adicionarNotificacao(
        'Selecione um produto.',
        'erro'
      );
      return;
    }

    if (!qtd || qtd <= 0) {
      adicionarNotificacao(
        'Quantidade inválida.',
        'erro'
      );
      return;
    }

    const produto = produtos.find(
      (p) => p.id === produtoSelecionadoId
    );

    if (!produto) {
      adicionarNotificacao(
        'Produto não encontrado.',
        'erro'
      );
      return;
    }

    /*
     * Evita adicionar o mesmo produto duas vezes.
     */
    const ingredienteExistente = ingredientes.find(
      (item) => item.produtoId === produto.id
    );

    if (ingredienteExistente) {
      adicionarNotificacao(
        'Esse produto já foi adicionado à receita.',
        'erro'
      );
      return;
    }

    const novoIngrediente: Ingrediente = {
      produtoId: produto.id,
      nome: produto.nome,
      tipo: tipoSelecionado,
      qtd,
    };

    setIngredientes((prev) => [
      ...prev,
      novoIngrediente,
    ]);

    setQtdIngrediente('');
  };

  /*
   * Remove um ingrediente.
   */
  const removerIngrediente = (index: number) => {
    setIngredientes((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /*
   * Exclui uma receita existente.
   */
  const handleExcluir = async (
    id: string,
    nomeReceita: string
  ) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a receita "${nomeReceita}"?`
      )
    ) {
      return;
    }

    await excluirReceita(id);
  };

  return (
    <div className="p-8 relative bg-adega-bg text-adega-text min-h-full transition-colors">

      <h2 className="text-2xl font-bold mb-6 text-adega-text">
        Cadastrar Receitas
      </h2>

      <form
        onSubmit={salvar}
        className="bg-adega-card border border-adega-border p-6 rounded-3xl shadow-sm mb-8"
      >

        {/* NOME DA RECEITA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-adega-muted">
              Nome da Receita
            </label>

            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Caipirinha de Limão"
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* PREÇO */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-adega-muted">
              Preço de Venda
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: 25.00"
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

        </div>

        {/* SEPARADOR */}
        <div className="border-t border-adega-border my-6" />

        <h3 className="text-lg font-bold mb-4 text-adega-text">
          Ingredientes
        </h3>

        {/* ADICIONAR INGREDIENTE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

          {/* PRODUTO */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold text-adega-muted">
              Produto
            </label>

            <select
              value={produtoSelecionadoId}
              onChange={(e) =>
                setProdutoSelecionadoId(e.target.value)
              }
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">
                Selecione um produto
              </option>

              {produtos.map((produto) => (
                <option
                  key={produto.id}
                  value={produto.id}
                >
                  {produto.nome}
                </option>
              ))}
            </select>
          </div>

          {/* TIPO */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-adega-muted">
              Tipo
            </label>

            <select
              value={tipoSelecionado}
              onChange={(e) =>
                setTipoSelecionado(
                  e.target.value as 'ML' | 'Unidade'
                )
              }
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ML">
                ML
              </option>

              <option value="Unidade">
                Unidade
              </option>
            </select>
          </div>

          {/* QUANTIDADE */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-adega-muted">
              Quantidade
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={qtdIngrediente}
              onChange={(e) =>
                setQtdIngrediente(e.target.value)
              }
              placeholder="Ex: 50"
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

        {/* BOTÃO ADICIONAR */}
        <button
          type="button"
          onClick={adicionarIngrediente}
          className="mt-4 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
        >
          + Adicionar Ingrediente
        </button>

        {/* LISTA DE INGREDIENTES */}
        {ingredientes.length > 0 && (
          <div className="mt-6">

            <h4 className="text-sm font-bold mb-3 text-adega-text">
              Ingredientes adicionados
            </h4>

            <div className="space-y-2">

              {ingredientes.map((ingrediente, index) => (
                <div
                  key={`${ingrediente.produtoId}-${index}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-adega-bg border border-adega-border"
                >

                  <div>
                    <p className="font-semibold text-adega-text">
                      {ingrediente.nome}
                    </p>

                    <p className="text-xs text-adega-muted">
                      Quantidade: {ingrediente.qtd}{' '}
                      {ingrediente.tipo}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removerIngrediente(index)
                    }
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                  >
                    Remover
                  </button>

                </div>
              ))}

            </div>

          </div>
        )}

        {/* SALVAR */}
        <div className="flex gap-2 mt-6">

          <button
            type="submit"
            disabled={salvando}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            {salvando
              ? 'Salvando...'
              : 'Salvar Receita Completa'}
          </button>

          {(nome ||
            preco ||
            ingredientes.length > 0 ||
            produtoSelecionadoId ||
            qtdIngrediente) && (
              <button
                type="button"
                onClick={limparDraft}
                className="px-6 py-3 rounded-xl border border-adega-border text-adega-text hover:bg-adega-bg transition-colors"
              >
                Limpar
              </button>
            )}

        </div>

      </form>

      {/* LISTA DE RECEITAS */}
      <div className="bg-adega-card border border-adega-border rounded-3xl shadow-sm p-6">

        <h3 className="text-xl font-bold mb-5 text-adega-text">
          Receitas Cadastradas
        </h3>

        {receitas.length === 0 ? (
          <div className="text-center py-10 text-adega-muted">
            Nenhuma receita cadastrada.
          </div>
        ) : (
          <div className="space-y-4">

            {receitas.map((receita) => (
              <div
                key={receita.id}
                className="border border-adega-border rounded-2xl p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h4 className="font-bold text-lg text-adega-text">
                      {receita.nome}
                    </h4>

                    <p className="text-sm text-adega-muted mt-1">
                      Preço: R${' '}
                      {Number(receita.preco).toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleExcluir(
                        receita.id,
                        receita.nome
                      )
                    }
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                  >
                    Excluir
                  </button>

                </div>

                {receita.ingredientes &&
                  receita.ingredientes.length > 0 && (
                    <div className="mt-4">

                      <p className="text-xs font-semibold text-adega-muted mb-2">
                        Ingredientes:
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {receita.ingredientes.map(
                          (ingrediente, index) => (
                            <span
                              key={`${ingrediente.produtoId}-${index}`}
                              className="px-3 py-2 rounded-lg bg-adega-bg border border-adega-border text-sm text-adega-text"
                            >
                              {ingrediente.nome} —{' '}
                              {ingrediente.qtd}{' '}
                              {ingrediente.tipo}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}