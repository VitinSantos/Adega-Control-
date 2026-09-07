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

const RECEITA_DRAFT_KEY =
  'adegacontrol_receita_draft';

const draftVazio: ReceitaDraft = {
  nome: '',
  preco: '',
  ingredientes: [],
  produtoSelecionadoId: '',
  tipoSelecionado: 'ML',
  qtdIngrediente: '',
};

export function Receitas() {
  const {
    produtos,
    receitas,
    adicionarNotificacao,
    criarReceita,
    excluirReceita,
  } = useApp();

  const [ingredientes, setIngredientes] =
    useState<Ingrediente[]>([]);

  const [salvando, setSalvando] =
    useState(false);

  const [nome, setNome] = useState('');

  const [preco, setPreco] = useState('');

  const [produtoSelecionadoId, setProdutoSelecionadoId] =
    useState('');

  const [tipoSelecionado, setTipoSelecionado] =
    useState<'ML' | 'Unidade'>('ML');

  const [qtdIngrediente, setQtdIngrediente] =
    useState('');

  /*
   * RESTAURA O RASCUNHO
   */
  useEffect(() => {
    try {
      const salvo =
        localStorage.getItem(RECEITA_DRAFT_KEY);

      if (!salvo) {
        return;
      }

      const dados: ReceitaDraft =
        JSON.parse(salvo);

      setNome(dados.nome || '');
      setPreco(dados.preco || '');

      setIngredientes(
        Array.isArray(dados.ingredientes)
          ? dados.ingredientes
          : []
      );

      setProdutoSelecionadoId(
        dados.produtoSelecionadoId || ''
      );

      setTipoSelecionado(
        dados.tipoSelecionado || 'ML'
      );

      setQtdIngrediente(
        dados.qtdIngrediente || ''
      );
    } catch (error) {
      console.error(
        'Erro ao restaurar rascunho da receita:',
        error
      );
    }
  }, []);

  /*
   * SALVA O RASCUNHO AUTOMATICAMENTE
   */
  useEffect(() => {
    try {
      const existeAlgumDado =
        nome.trim() !== '' ||
        preco.trim() !== '' ||
        ingredientes.length > 0 ||
        produtoSelecionadoId !== '' ||
        qtdIngrediente.trim() !== '';

      if (!existeAlgumDado) {
        localStorage.removeItem(
          RECEITA_DRAFT_KEY
        );
        return;
      }

      const draft: ReceitaDraft = {
        nome,
        preco,
        ingredientes,
        produtoSelecionadoId,
        tipoSelecionado,
        qtdIngrediente,
      };

      localStorage.setItem(
        RECEITA_DRAFT_KEY,
        JSON.stringify(draft)
      );
    } catch (error) {
      console.error(
        'Erro ao salvar rascunho da receita:',
        error
      );
    }
  }, [
    nome,
    preco,
    ingredientes,
    produtoSelecionadoId,
    tipoSelecionado,
    qtdIngrediente,
  ]);

  const limparFormulario = () => {
    setNome('');
    setPreco('');
    setIngredientes([]);
    setProdutoSelecionadoId('');
    setTipoSelecionado('ML');
    setQtdIngrediente('');

    localStorage.removeItem(
      RECEITA_DRAFT_KEY
    );
  };

  const salvar = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!nome.trim()) {
      adicionarNotificacao(
        'Informe o nome da receita.',
        'erro'
      );
      return;
    }

    if (!preco || Number(preco) < 0) {
      adicionarNotificacao(
        'Informe um preço válido.',
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
      limparFormulario();
    }
  };

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

    setIngredientes((anterior) => [
      ...anterior,
      {
        produtoId: produto.id,
        nome: produto.nome,
        tipo: tipoSelecionado,
        qtd,
      },
    ]);

    setQtdIngrediente('');
  };

  const removerIngrediente = (index: number) => {
    setIngredientes((anterior) =>
      anterior.filter(
        (_, idx) => idx !== index
      )
    );
  };

  const handleExcluir = async (
    id: string,
    nome: string
  ) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a receita "${nome}"?`
      )
    ) {
      return;
    }

    await excluirReceita(id);
  };

  return (
    <div className="p-8 bg-adega-bg text-adega-text min-h-full transition-colors">

      <h2 className="text-2xl font-bold mb-6 text-adega-text">
        Cadastrar Receitas
      </h2>

      <form
        onSubmit={salvar}
        className="bg-adega-card border border-adega-border p-6 rounded-3xl shadow-sm mb-8 space-y-4"
      >

        {/* NOME */}
        <div>
          <label className="block text-xs font-semibold text-adega-muted mb-1">
            Nome da Receita
          </label>

          <input
            name="nome"
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
            placeholder="Ex: Caipirinha de Limão"
            className="border border-adega-border p-3 w-full rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* PREÇO */}
        <div>
          <label className="block text-xs font-semibold text-adega-muted mb-1">
            Preço de Venda
          </label>

          <input
            name="preco"
            type="number"
            step="0.01"
            min="0"
            value={preco}
            onChange={(e) =>
              setPreco(e.target.value)
            }
            placeholder="Ex: 20.00"
            className="border border-adega-border p-3 w-full rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* INGREDIENTES */}
        <div className="pt-2">

          <label className="block text-xs font-semibold text-adega-muted mb-1">
            Adicionar Ingredientes
          </label>

          <div className="flex flex-col sm:flex-row gap-2 items-center">

            <select
              value={produtoSelecionadoId}
              onChange={(e) =>
                setProdutoSelecionadoId(
                  e.target.value
                )
              }
              className="border border-adega-border p-3 flex-1 rounded-xl bg-adega-bg text-adega-text outline-none focus:ring-2 focus:ring-emerald-500 w-full"
            >
              <option value="">
                Selecione um produto...
              </option>

              {produtos.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.nome}
                </option>
              ))}
            </select>

            <select
              value={tipoSelecionado}
              onChange={(e) =>
                setTipoSelecionado(
                  e.target.value as
                  | 'ML'
                  | 'Unidade'
                )
              }
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="ML">
                ML
              </option>

              <option value="Unidade">
                Unidade
              </option>
            </select>

            <input
              value={qtdIngrediente}
              onChange={(e) =>
                setQtdIngrediente(
                  e.target.value
                )
              }
              type="number"
              min="0"
              step="0.01"
              placeholder="Qtd"
              className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-28"
            />

            <button
              type="button"
              onClick={adicionarIngrediente}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full sm:w-auto shadow-sm"
            >
              +
            </button>

          </div>
        </div>

        {/* LISTA */}
        <ul className="mb-4 bg-adega-bg p-3 border border-adega-border rounded-2xl space-y-2">

          {ingredientes.length === 0 && (
            <li className="text-adega-muted text-xs italic text-center py-2">
              Nenhum ingrediente adicionado...
            </li>
          )}

          {ingredientes.map((ing, i) => (
            <li
              key={`${ing.produtoId}-${i}`}
              className="flex justify-between items-center p-2 border-b border-adega-border/50 text-sm"
            >
              <span className="text-adega-text font-medium">
                {ing.nome} ({ing.tipo}):{' '}
                <strong className="text-emerald-500">
                  {ing.qtd}
                </strong>
              </span>

              <button
                type="button"
                onClick={() =>
                  removerIngrediente(i)
                }
                className="text-red-500 hover:text-red-400 text-xs font-bold transition"
              >
                Remover
              </button>
            </li>
          ))}

        </ul>

        {/* SALVAR */}
        <button
          type="submit"
          disabled={salvando}
          className="bg-emerald-600 text-white w-full py-3.5 font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          {salvando
            ? 'Salvando...'
            : 'Salvar Receita Completa'}
        </button>

      </form>

      {/* RECEITAS CADASTRADAS */}
      <h2 className="text-xl font-bold mb-4 text-adega-text">
        Receitas Cadastradas
      </h2>

      <div className="grid gap-3">

        {receitas.length === 0 ? (
          <div className="bg-adega-card border border-adega-border p-6 rounded-3xl text-center text-adega-muted text-xs shadow-sm">
            Nenhuma receita cadastrada.
          </div>
        ) : (
          receitas.map((r) => (
            <div
              key={r.id}
              className="bg-adega-card border border-adega-border p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4 transition hover:border-adega-text/30"
            >

              <div>

                <p className="font-bold text-lg text-adega-text">
                  {r.nome}
                </p>

                <p className="text-xs text-emerald-500 font-semibold mt-0.5">
                  R${' '}
                  {Number(
                    r.preco || 0
                  ).toFixed(2)}
                </p>

                <p className="text-xs text-adega-muted mt-1">
                  Ingredientes:{' '}
                  {r.ingredientes
                    .map(
                      (ing) =>
                        `${ing.nome} (${ing.qtd}${ing.tipo})`
                    )
                    .join(', ')}
                </p>

              </div>

              <button
                onClick={() =>
                  handleExcluir(
                    r.id,
                    r.nome
                  )
                }
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition shadow-sm"
              >
                Excluir
              </button>

            </div>
          ))
        )}

      </div>
    </div>
  );
}