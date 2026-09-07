import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Produto } from '../types';

interface EstoqueFormData {
  nome: string;
  ml: string;
  qtd: string;
  custo: string;
  preco: string;
  alerta: string;
}

const ESTOQUE_DRAFT_KEY = 'adegacontrol_estoque_draft';

const formularioVazio: EstoqueFormData = {
  nome: '',
  ml: '',
  qtd: '',
  custo: '',
  preco: '',
  alerta: '',
};

export function Estoque() {
  const {
    produtos,
    notificacoes,
    setNotificacoes,
    adicionarNotificacao,
    nomeProdutoExiste,
    criarProduto,
    atualizarProduto,
    excluirProduto,
  } = useApp();

  const [editando, setEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [formData, setFormData] =
    useState<EstoqueFormData>(formularioVazio);

  /*
   * RESTAURA O RASCUNHO
   *
   * Só fazemos isso uma vez quando a tela é aberta.
   */
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(ESTOQUE_DRAFT_KEY);

      if (salvo) {
        const dados = JSON.parse(salvo);

        setFormData({
          ...formularioVazio,
          ...dados,
        });
      }
    } catch (error) {
      console.error(
        'Erro ao restaurar rascunho do estoque:',
        error
      );
    }
  }, []);

  /*
   * SALVA AUTOMATICAMENTE O RASCUNHO
   *
   * Cada alteração nos campos é salva no navegador.
   */
  useEffect(() => {
    try {
      const existeAlgumDado = Object.values(formData).some(
        (valor) => valor.trim() !== ''
      );

      if (existeAlgumDado) {
        localStorage.setItem(
          ESTOQUE_DRAFT_KEY,
          JSON.stringify(formData)
        );
      } else {
        localStorage.removeItem(ESTOQUE_DRAFT_KEY);
      }
    } catch (error) {
      console.error(
        'Erro ao salvar rascunho do estoque:',
        error
      );
    }
  }, [formData]);

  /*
   * Quando começa a editar um produto,
   * carregamos os dados dele no formulário.
   */
  useEffect(() => {
    if (!editando) {
      return;
    }

    setFormData({
      nome: editando.nome || '',
      ml:
        editando.mlPorGarrafa > 0
          ? String(editando.mlPorGarrafa)
          : '',
      qtd: String(editando.qtd ?? ''),
      custo: String(editando.precoCusto ?? ''),
      preco: String(editando.preco ?? ''),
      alerta: String(editando.alertaMinimo ?? ''),
    });
  }, [editando]);

  const alterarCampo = (
    campo: keyof EstoqueFormData,
    valor: string
  ) => {
    setFormData((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const limparFormulario = () => {
    setFormData(formularioVazio);
    setEditando(null);
    localStorage.removeItem(ESTOQUE_DRAFT_KEY);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const nome = formData.nome.trim();

    const mlInput =
      formData.ml.trim() === ''
        ? 0
        : Number(formData.ml);

    if (!nome) {
      adicionarNotificacao(
        'Informe o nome do produto.',
        'erro'
      );
      return;
    }

    if (nomeProdutoExiste(nome, editando?.id)) {
      adicionarNotificacao(
        `Já existe um produto chamado "${nome}".`,
        'erro'
      );
      return;
    }

    const dados = {
      nome,

      qtd: Number(formData.qtd),

      preco: Number(formData.preco),

      precoCusto: Number(formData.custo),

      mlPorGarrafa: mlInput,

      alertaMinimo: Number(formData.alerta),
    };

    setSalvando(true);

    const sucesso = editando
      ? await atualizarProduto({
        ...dados,
        id: editando.id,
      })
      : await criarProduto(dados);

    setSalvando(false);

    if (sucesso) {
      limparFormulario();
    }
  };

  const handleExcluir = async (
    id: string,
    nome: string
  ) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir "${nome}"? Essa ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    await excluirProduto(id);
  };

  return (
    <div className="p-8 relative bg-adega-bg text-adega-text min-h-full transition-colors">

      {/* NOTIFICAÇÕES */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {notificacoes.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl shadow-xl text-white flex justify-between items-center transition-all duration-300 ${n.tipo === 'erro'
                ? 'bg-red-600 border-l-4 border-red-800'
                : 'bg-amber-500 border-l-4 border-amber-700'
              }`}
          >
            <span className="font-medium text-sm">
              {n.mensagem}
            </span>

            <button
              onClick={() =>
                setNotificacoes(
                  notificacoes.filter(
                    (x) => x.id !== n.id
                  )
                )
              }
              className="ml-4 font-bold text-white hover:text-gray-200 text-lg"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-adega-text">
        {editando
          ? 'Editar Produto'
          : 'Estoque - Novo Produto'}
      </h2>

      {/* FORMULÁRIO */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 bg-adega-card border border-adega-border p-6 rounded-3xl shadow-sm"
      >

        {/* NOME */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">
            Nome do Produto
          </label>

          <input
            name="nome"
            value={formData.nome}
            onChange={(e) =>
              alterarCampo('nome', e.target.value)
            }
            placeholder="Ex: Jack Daniels"
            className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* ML */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">
            ML por Garrafa
            <span className="font-normal ml-1">
              (Opcional)
            </span>
          </label>

          <input
            name="ml"
            type="number"
            min="0"
            step="1"
            value={formData.ml}
            onChange={(e) =>
              alterarCampo('ml', e.target.value)
            }
            placeholder="Ex: 1000"
            className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <span className="text-[11px] text-adega-muted">
            Deixe vazio para produtos vendidos por unidade.
          </span>
        </div>

        {/* QUANTIDADE */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">
            Qtd em Estoque
          </label>

          <input
            name="qtd"
            type="number"
            step="0.01"
            min="0"
            value={formData.qtd}
            onChange={(e) =>
              alterarCampo('qtd', e.target.value)
            }
            placeholder="Ex: 5"
            className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* CUSTO */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">
            Preço de Compra (Custo)
          </label>

          <input
            name="custo"
            type="number"
            step="0.01"
            min="0"
            value={formData.custo}
            onChange={(e) =>
              alterarCampo('custo', e.target.value)
            }
            placeholder="Ex: 80.00"
            className="border border-red-300 dark:border-red-900 p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        {/* PREÇO DE VENDA */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">
            Preço de Venda
          </label>

          <input
            name="preco"
            type="number"
            step="0.01"
            min="0"
            value={formData.preco}
            onChange={(e) =>
              alterarCampo('preco', e.target.value)
            }
            placeholder="Ex: 150.00"
            className="border border-emerald-300 dark:border-emerald-900 p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* ALERTA */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-adega-muted">
            Alerta Mínimo (Un)
          </label>

          <input
            name="alerta"
            type="number"
            min="0"
            value={formData.alerta}
            onChange={(e) =>
              alterarCampo('alerta', e.target.value)
            }
            placeholder="Ex: 5"
            className="border border-adega-border p-3 rounded-xl bg-adega-bg text-adega-text placeholder-adega-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* BOTÕES */}
        <div className="col-span-2 md:col-span-3 flex gap-2 pt-2">

          <button
            type="submit"
            disabled={salvando}
            className="flex-1 bg-emerald-600 text-white py-3 font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {salvando
              ? 'Salvando...'
              : editando
                ? 'Salvar Edição'
                : 'Adicionar ao Estoque'}
          </button>

          {editando && (
            <button
              type="button"
              onClick={limparFormulario}
              className="px-6 bg-adega-bg border border-adega-border text-adega-text py-3 font-bold rounded-xl hover:bg-adega-border/50 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* TABELA */}
      <div className="bg-adega-card border border-adega-border rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-sm md:text-base border-collapse">

          <thead>
            <tr className="bg-adega-bg border-b border-adega-border text-left text-adega-muted">
              <th className="p-4">Produto</th>
              <th className="p-4">Qtd</th>
              <th className="p-4">Custo</th>
              <th className="p-4">Venda</th>
              <th className="p-4 text-center">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {produtos.map((p) => {
              const garrafasFechadas = Math.trunc(p.qtd);

              const volumeTotalML =
                p.mlPorGarrafa > 0
                  ? Math.round(
                    p.qtd * p.mlPorGarrafa
                  )
                  : 0;

              const estoqueZeradoOuNegativo =
                p.qtd <= 0;

              return (
                <tr
                  key={p.id}
                  className="border-b border-adega-border hover:bg-adega-bg/50 transition-colors"
                >
                  <td className="p-4 font-medium text-adega-text">
                    {p.nome}

                    <br />

                    <span
                      className={`text-xs ${estoqueZeradoOuNegativo
                          ? 'text-red-500'
                          : 'text-adega-muted'
                        }`}
                    >
                      {p.mlPorGarrafa > 0
                        ? `${volumeTotalML} ml total`
                        : ''}
                    </span>
                  </td>

                  <td
                    className={`p-4 font-bold ${estoqueZeradoOuNegativo
                        ? 'text-red-500'
                        : garrafasFechadas <=
                          p.alertaMinimo
                          ? 'text-amber-500'
                          : 'text-adega-text'
                      }`}
                  >
                    {garrafasFechadas} un{' '}
                    {estoqueZeradoOuNegativo
                      ? '❌'
                      : garrafasFechadas <=
                        p.alertaMinimo
                        ? '⚠️'
                        : ''}
                  </td>

                  <td className="p-4 text-red-500 font-medium">
                    R${' '}
                    {p.precoCusto?.toFixed(2) ||
                      '0.00'}
                  </td>

                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">
                    R$ {p.preco.toFixed(2)}
                  </td>

                  <td className="p-4 flex gap-2 justify-center">

                    <button
                      onClick={() =>
                        setEditando(p)
                      }
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition text-xs font-bold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        handleExcluir(
                          p.id,
                          p.nome
                        )
                      }
                      className="bg-red-600 text-white px-3 py-1.5 rounded-xl hover:bg-red-700 transition text-xs font-bold"
                    >
                      Excluir
                    </button>

                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}