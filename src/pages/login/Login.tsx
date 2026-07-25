import { useState } from 'react';
import { Plus, CheckCircle2, Trash2, Edit2, X, MessageCircle, Layers, ArrowRight, ArrowLeft } from 'lucide-react';

interface DetalhesAbastecimento {
  caixasFeitas: number;
  teveRetorno: boolean;
  caixasRetorno?: number;
  motivoRetorno?: string;
}

interface Tarefa {
  id: number;
  titulo: string;
  sessao: string;
  prioridade: 'Baixa' | 'Média' | 'Urgente';
  status: 'Pendente' | 'Concluída';
  responsavel: string;
  detalhesAbastecimento?: DetalhesAbastecimento;
}

export function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([
    { id: 1, titulo: 'Repor geladeiras de Cervejas', sessao: 'Salão / Geladeiras', prioridade: 'Urgente', status: 'Pendente', responsavel: 'Victor Santos' },
    { id: 2, titulo: 'Abastecer estoque de Destilados', sessao: 'Estoque de Bebidas', prioridade: 'Média', status: 'Pendente', responsavel: 'Carlos Souza' },
    { id: 3, titulo: 'Conferir caixa e troco inicial', sessao: 'Caixa / PDV', prioridade: 'Média', status: 'Concluída', responsavel: 'Ana Costa' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titulo: '',
    sessao: 'Salão / Geladeiras',
    prioridade: 'Média' as 'Baixa' | 'Média' | 'Urgente',
    responsavel: ''
  });

  // Estados para o fluxo interativo de Abastecimento/Reposição
  const [isAbastecimentoModalOpen, setIsAbastecimentoModalOpen] = useState(false);
  const [tarefaEmConclusao, setTarefaEmConclusao] = useState<Tarefa | null>(null);
  const [etapaAbastecimento, setEtapaAbastecimento] = useState<1 | 2 | 3>(1);
  const [dadosAbastecimento, setDadosAbastecimento] = useState({
    caixasFeitas: 1,
    teveRetorno: 'nao' as 'sim' | 'nao',
    caixasRetorno: 1,
    motivoRetorno: ''
  });

  const linkGrupoWhatsApp = 'https://chat.whatsapp.com/ErGn0bzRVLg4swFlOCH2Xn?s=cl&p=i&ilr=1';

  const abrirNovo = () => {
    setEditingId(null);
    setForm({ titulo: '', sessao: 'Salão / Geladeiras', prioridade: 'Média', responsavel: '' });
    setIsModalOpen(true);
  };

  const abrirEdicao = (t: Tarefa) => {
    setEditingId(t.id);
    setForm({ titulo: t.titulo, sessao: t.sessao, prioridade: t.prioridade, responsavel: t.responsavel });
    setIsModalOpen(true);
  };

  const salvarTarefa = () => {
    if (!form.titulo.trim()) return;

    if (editingId) {
      setTarefas(tarefas.map(t => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setTarefas([...tarefas, { id: Date.now(), ...form, status: 'Pendente' }]);
    }
    setIsModalOpen(false);
  };

  const deletarTarefa = (id: number) => {
    if (confirm('Deseja excluir esta tarefa?')) {
      setTarefas(tarefas.filter(t => t.id !== id));
    }
  };

  // Intercepta a tentativa de concluir uma tarefa
  const lidarComCliqueConcluir = (t: Tarefa) => {
    if (t.status === 'Concluída') {
      setTarefas(tarefas.map(item => item.id === t.id ? { ...item, status: 'Pendente', detalhesAbastecimento: undefined } : item));
      return;
    }

    // Verifica se a tarefa é de abastecimento/reposição
    const ehAbastecimento = t.titulo.toLowerCase().includes('abastecimento') || t.titulo.toLowerCase().includes('repor') || t.titulo.toLowerCase().includes('estoque');

    if (ehAbastecimento) {
      setTarefaEmConclusao(t);
      setDadosAbastecimento({ caixasFeitas: 1, teveRetorno: 'nao', caixasRetorno: 1, motivoRetorno: '' });
      setEtapaAbastecimento(1);
      setIsAbastecimentoModalOpen(true);
    } else {
      setTarefas(tarefas.map(item => item.id === t.id ? { ...item, status: 'Concluída' } : item));
    }
  };

  // Salva o fluxo de abastecimento e conclui a tarefa
  const concluirAbastecimentoFinal = () => {
    if (!tarefaEmConclusao) return;

    const detalhes: DetalhesAbastecimento = {
      caixasFeitas: Number(dadosAbastecimento.caixasFeitas) || 1,
      teveRetorno: dadosAbastecimento.teveRetorno === 'sim',
      caixasRetorno: dadosAbastecimento.teveRetorno === 'sim' ? Number(dadosAbastecimento.caixasRetorno) : 0,
      motivoRetorno: dadosAbastecimento.teveRetorno === 'sim' ? dadosAbastecimento.motivoRetorno : undefined,
    };

    setTarefas(tarefas.map(t => {
      if (t.id === tarefaEmConclusao.id) {
        return { ...t, status: 'Concluída', detalhesAbastecimento: detalhes };
      }
      return t;
    }));

    setIsAbastecimentoModalOpen(false);
    setTarefaEmConclusao(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Tarefas</h1>
          <p className="text-gray-500 text-sm">Acompanhe as demandas operacionais, reposições e geladeiras da adega.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open(linkGrupoWhatsApp, '_blank')}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm"
          >
            <MessageCircle size={16} /> Grupo do WhatsApp
          </button>

          <button 
            onClick={abrirNovo} 
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
      </header>

      {/* Modal de Criação / Edição de Tarefas */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-bold text-lg">{editingId ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-500"/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Título da Tarefa *</label>
                <input 
                  className="w-full p-2 border rounded-lg text-sm" 
                  placeholder="Ex: Repor geladeiras de cerveja" 
                  value={form.titulo} 
                  onChange={e => setForm({...form, titulo: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sessão / Setor</label>
                  <select 
                    className="w-full p-2 border rounded-lg text-sm bg-white"
                    value={form.sessao}
                    onChange={e => setForm({...form, sessao: e.target.value})}
                  >
                    <option value="Salão / Geladeiras">Salão / Geladeiras</option>
                    <option value="Caixa / PDV">Caixa / PDV</option>
                    <option value="Estoque de Bebidas">Estoque de Bebidas</option>
                    <option value="Atendimento / Balcão">Atendimento / Balcão</option>
                    <option value="Geral">Geral (Toda a Adega)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prioridade</label>
                  <select 
                    className="w-full p-2 border rounded-lg text-sm bg-white"
                    value={form.prioridade}
                    onChange={e => setForm({...form, prioridade: e.target.value as any})}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Responsável / Atribuído</label>
                <input 
                  className="w-full p-2 border rounded-lg text-sm" 
                  placeholder="Ex: Carlos Souza" 
                  value={form.responsavel} 
                  onChange={e => setForm({...form, responsavel: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-black">Cancelar</button>
              <button onClick={salvarTarefa} className="px-5 py-2 bg-black text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition">
                {editingId ? 'Salvar Alterações' : 'Criar Tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Passo a Passo (Wizard) para Reposição/Abastecimento */}
      {isAbastecimentoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">Registro de Reposição</h3>
              <button onClick={() => setIsAbastecimentoModalOpen(false)}><X size={20} className="text-gray-500"/></button>
            </div>

            {/* ETAPA 1 */}
            {etapaAbastecimento === 1 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Passo 1 de 2</span>
                  <h4 className="font-semibold text-gray-900 text-base mt-2">Quantas caixas ou fardos foram repostos?</h4>
                  <p className="text-xs text-gray-500 mt-1">Informe a quantidade total movimentada nesta atividade.</p>
                </div>

                <input 
                  type="number" 
                  min={1}
                  className="w-full p-3 border rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={dadosAbastecimento.caixasFeitas}
                  onChange={e => setDadosAbastecimento({...dadosAbastecimento, caixasFeitas: Number(e.target.value)})}
                />

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button 
                    onClick={() => {
                      if (dadosAbastecimento.caixasFeitas > 0) {
                        setEtapaAbastecimento(2);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Próximo <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2 */}
            {etapaAbastecimento === 2 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Passo 2 de 2</span>
                  <h4 className="font-semibold text-gray-900 text-base mt-2">Houve retorno de mercadoria?</h4>
                  <p className="text-xs text-gray-500 mt-1">Sobrou produto que precisou voltar ao estoque principal?</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDadosAbastecimento({...dadosAbastecimento, teveRetorno: 'nao'})}
                    className={`py-3 px-4 rounded-lg border font-semibold text-sm transition ${
                      dadosAbastecimento.teveRetorno === 'nao' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Não houve retorno
                  </button>

                  <button
                    type="button"
                    onClick={() => setDadosAbastecimento({...dadosAbastecimento, teveRetorno: 'sim'})}
                    className={`py-3 px-4 rounded-lg border font-semibold text-sm transition ${
                      dadosAbastecimento.teveRetorno === 'sim' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Sim, retornou
                  </button>
                </div>

                {dadosAbastecimento.teveRetorno === 'sim' && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Quantas caixas/unidades retornaram?</label>
                      <input 
                        type="number" 
                        min={1}
                        className="w-full p-2 border rounded-lg text-sm"
                        value={dadosAbastecimento.caixasRetorno}
                        onChange={e => setDadosAbastecimento({...dadosAbastecimento, caixasRetorno: Number(e.target.value)})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Qual o motivo do retorno? *</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Ex: Geladeira cheia, produto avariado..."
                        value={dadosAbastecimento.motivoRetorno}
                        onChange={e => setDadosAbastecimento({...dadosAbastecimento, motivoRetorno: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-2 pt-4 border-t">
                  <button 
                    onClick={() => setEtapaAbastecimento(1)}
                    className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-black"
                  >
                    <ArrowLeft size={14} /> Voltar
                  </button>

                  <button 
                    onClick={concluirAbastecimentoFinal}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                  >
                    Concluir Tarefa
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Lista de Tarefas */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-sm text-gray-700 flex items-center gap-2">
            <Layers size={16} /> Lista de Demandas Ativas
          </h2>
          <span className="text-xs text-gray-500">Total: {tarefas.length} tarefas</span>
        </div>

        <div className="divide-y divide-gray-200">
          {tarefas.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Nenhuma tarefa cadastrada no momento.</p>
          ) : (
            tarefas.map((t) => (
              <div key={t.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => lidarComCliqueConcluir(t)}
                    className={`mt-0.5 p-1 rounded-full border transition ${
                      t.status === 'Concluída' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-gray-300 hover:border-black text-transparent'
                    }`}
                    title="Marcar como concluída"
                  >
                    <CheckCircle2 size={14} />
                  </button>

                  <div>
                    <h3 className={`font-semibold text-sm ${t.status === 'Concluída' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {t.titulo}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        {t.sessao}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Responsável: <strong className="text-gray-700">{t.responsavel || 'Não atribuído'}</strong>
                      </span>
                    </div>

                    {t.detalhesAbastecimento && (
                      <div className="mt-2 text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-lg flex flex-wrap gap-3">
                        <span>📦 <strong>{t.detalhesAbastecimento.caixasFeitas}</strong> caixas/fardos repostos</span>
                        <span>•</span>
                        {t.detalhesAbastecimento.teveRetorno ? (
                          <span className="text-amber-800">⚠️ Retorno: <strong>{t.detalhesAbastecimento.caixasRetorno}</strong> unidade(s) (Motivo: {t.detalhesAbastecimento.motivoRetorno})</span>
                        ) : (
                          <span>✨ Sem retornos</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    t.prioridade === 'Urgente' ? 'bg-red-50 text-red-700 border border-red-200' :
                    t.prioridade === 'Média' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {t.prioridade}
                  </span>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                    t.status === 'Concluída' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {t.status}
                  </span>

                  <div className="flex items-center gap-1 border-l pl-3 border-gray-200">
                    <button onClick={() => abrirEdicao(t)} className="p-1.5 text-gray-400 hover:text-black transition" title="Editar">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deletarTarefa(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}