# Relatório geral do SaaS — Adega Control

**Versão do relatório:** 1.0  
**Data:** 4 de outubro de 2026  
**Escopo:** arquitetura atual, funcionamento, tecnologia, riscos, melhorias de UX/UI, segurança, qualidade, operação e roadmap.

> Este documento descreve o estado observado no código-fonte do frontend. A confirmação final de RLS, policies, triggers, RPCs, índices, buckets e constraints exige uma auditoria do schema real do projeto Supabase. Portanto, os itens marcados como **a validar** não devem ser considerados garantidos apenas porque existem no frontend.

---

## 1. Resumo executivo

O Adega Control é um sistema web para gestão de adega, com foco em:

- autenticação de usuários;
- dashboard operacional;
- cadastro e manutenção de produtos;
- controle de estoque;
- operação de vendas pelo PDV;
- cadastro de receitas;
- relatórios;
- tema claro/escuro;
- persistência em Supabase.

A base atual é adequada para um beta funcional, mas ainda não deve ser considerada pronta para comercialização ampla sem reforçar o banco, o isolamento entre clientes, a integridade das vendas e a observabilidade.

### Diagnóstico principal

**Pontos positivos:**

- React moderno com TypeScript;
- Vite para desenvolvimento e build;
- Supabase Auth e banco remoto;
- regras de negócio separadas em `src/lib/businessRules.ts`;
- mapeadores entre o modelo da aplicação e o banco;
- RPC já utilizada para registrar venda com baixa de estoque;
- testes unitários iniciais;
- tratamento básico de erros e notificações;
- suporte a responsividade e tema escuro.

**Riscos prioritários:**

1. O frontend não pode ser a camada de segurança: RLS e autorização precisam ser comprovados no Supabase.
2. Preço, custo, lucro, quantidade e estoque enviados pelo navegador não podem ser considerados confiáveis.
3. Produtos, receitas e vendas parecem ser carregados diretamente de tabelas, mas o escopo por organização/tenant precisa ser confirmado.
4. A sessão é lida em mais de um ponto da aplicação, o que aumenta a chance de estados duplicados ou inconsistentes.
5. O catálogo de testes ainda é pequeno para cobrir autenticação, RLS, concorrência, vendas e falhas de rede.
6. Não há evidência, neste frontend, de trilha de auditoria, paginação, monitoramento ou estratégia formal de ambientes.

---

## 2. Como o sistema funciona hoje

### Fluxo de inicialização

1. `src/main.tsx` inicializa o React.
2. `App` consulta a sessão do Supabase.
3. Enquanto a sessão é resolvida, o sistema mostra `Carregando sessão...`.
4. Usuários sem sessão visualizam `Login`.
5. Usuários autenticados carregam o `AppProvider` e os dados de produtos, receitas e vendas.
6. O `AppProvider` faz consultas paralelas ao Supabase.
7. Depois do carregamento, a navegação troca as páginas dentro de `App`.

### Módulos atuais

| Módulo | Responsabilidade |
|---|---|
| Login | Entrada e autenticação do usuário |
| Dashboard | Visão resumida da operação |
| PDV | Seleção de produtos e registro de venda |
| Estoque | Cadastro, edição, exclusão e baixa de produtos |
| Receitas | Cadastro e gestão de receitas |
| Relatórios | Visualização de indicadores e histórico |
| Sidebar | Navegação, tema e logout |

### Estado global

`AppContext` concentra:

- `produtos`;
- `receitas`;
- `vendas`;
- estado de carregamento;
- erro de conexão;
- notificações;
- operações CRUD;
- baixa de estoque;
- registro de vendas.

Essa abordagem é simples e funcional para o estágio atual. Com o crescimento do produto, deve-se separar estado de sessão, estado de domínio e estado de interface para reduzir re-renderizações e acoplamento.

### Persistência

A aplicação utiliza `@supabase/supabase-js` para:

- consultar tabelas;
- inserir produtos, receitas e vendas;
- atualizar produtos;
- excluir registros;
- observar mudanças de autenticação;
- chamar a RPC `registrar_venda_com_estoque`.

O cliente do Supabase deve conter somente URL pública e chave publicável/anon. `service_role` ou secret key jamais devem ser importados por código executado no navegador.

---

## 3. Tecnologias utilizadas

### Frontend

- React 19;
- TypeScript 6;
- Vite 8;
- Tailwind CSS 3;
- `lucide-react` para ícones;
- Recharts para gráficos;
- Supabase JavaScript SDK.

### Qualidade

- Vitest para testes;
- ESLint;
- TypeScript incremental/build;
- `npm run build` para compilação e bundle;
- `npm run lint` para análise estática;
- `npm run test` para testes unitários.

### Comandos disponíveis

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

### Arquitetura atual

```text
src/
├── App.tsx                 # shell, sessão e navegação principal
├── main.tsx                # bootstrap React
├── components/             # componentes reutilizáveis
├── context/                # estado global da aplicação e tema
├── lib/                    # Supabase, mappers e regras de negócio
├── pages/                  # telas funcionais
├── types.ts                # contratos de domínio
└── utils/                  # utilitários
```

---

## 4. Avaliação técnica por área

### 4.1 Arquitetura

**Situação atual:** aplicação SPA com navegação controlada por estado (`paginaAtual`) e dados globais no Context API.

**Pontos de atenção:**

- não há roteamento por URL, deep link ou proteção de rotas;
- recarregar a página não preserva a tela atual;
- `App` e `AppContext` acompanham a sessão separadamente;
- consultas, mutações, cache e notificações convivem no mesmo contexto;
- o carregamento inicial depende de três consultas paralelas sem paginação.

**Melhorias recomendadas:**

1. Adotar roteamento real com rotas protegidas.
2. Criar um `AuthProvider` único.
3. Separar `DataProvider`, `NotificationProvider` e estado visual.
4. Encapsular acesso a dados em serviços/repositórios.
5. Usar cache e invalidação por domínio quando o volume crescer.
6. Definir contratos de resposta e erros centralizados.

### 4.2 Banco de dados

**A validar no Supabase:**

- tabelas e colunas reais;
- chaves estrangeiras;
- constraints de quantidade e valores;
- índices;
- RLS em todas as tabelas expostas;
- policies para `SELECT`, `INSERT`, `UPDATE` e `DELETE`;
- RPC `registrar_venda_com_estoque`;
- triggers e views;
- buckets e policies de Storage;
- existência de organização/tenant.

**Modelo recomendado:**

```text
organizations
organization_members
profiles
products
sales
sale_items
stock_movements
recipes
audit_logs
```

Cada dado operacional deve ter `organization_id` ou ser alcançável por uma relação inequívoca até a organização. O filtro no frontend não substitui RLS.

### 4.3 Vendas e estoque

A existência de `registrar_venda_com_estoque` é uma boa direção, pois uma única operação pode manter venda e baixa consistentes. Porém, a função deve:

- recalcular total, custo e lucro usando dados do banco;
- validar cada produto e quantidade;
- bloquear quantidade zero, negativa, fracionamento inválido e estoque insuficiente;
- executar tudo em uma transação;
- tratar concorrência entre duas vendas simultâneas;
- registrar itens da venda por `produto_id`;
- preservar snapshot de nome, preço e custo no momento da venda;
- ser idempotente para retry;
- validar o usuário e o tenant no servidor;
- não confiar em `p_preco`, `p_custo` ou `p_lucro` enviados pelo cliente.

A função deve ser revisada por SQL e por testes de integração antes de o sistema receber usuários pagantes.

### 4.4 Datas e timezone

Vendas usam `data_hora_iso`, o que é positivo para ordenar eventos. Ainda assim:

- o banco deve armazenar o instante em UTC;
- a interface deve exibir no fuso da operação;
- a data de competência deve ser separada do timestamp técnico;
- relatórios não devem usar conversões implícitas do navegador;
- filtros de dia precisam definir claramente início inclusivo e fim exclusivo.

### 4.5 Estado e sessão

O sistema aguarda a sessão antes de exibir as telas, o que evita parte do problema de acesso prematuro. Recomenda-se consolidar esse fluxo para:

- evitar duas fontes de verdade para autenticação;
- limpar dados ao fazer logout;
- limpar dados ao trocar de usuário;
- lidar com expiração e refresh;
- impedir carregamentos concorrentes antigos de sobrescreverem o novo usuário;
- mostrar estado de sessão expirada com ação clara.

---

## 5. Auditoria de segurança

### 5.1 RLS e multi-tenancy — criticidade crítica

A regra obrigatória é: um usuário só pode acessar registros da própria organização e apenas conforme o seu papel.

Checklist:

- [ ] RLS ativado em toda tabela exposta;
- [ ] nenhum acesso baseado em `user_metadata`;
- [ ] autorização baseada em tabela de membros ou `app_metadata` controlado;
- [ ] policies usando `TO authenticated`;
- [ ] `USING` e `WITH CHECK` presentes em atualizações;
- [ ] `DELETE` limitado ao papel permitido;
- [ ] organização validada no banco;
- [ ] testes negativos tentam ler e modificar dados de outro tenant;
- [ ] views usam `security_invoker = true` quando aplicável;
- [ ] funções privilegiadas estão em schema não exposto e têm validação de identidade;
- [ ] nenhuma policy concede acesso amplo apenas por estar autenticado.

### 5.2 Chaves e variáveis de ambiente

- URL do Supabase e chave publicável podem estar no bundle.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` e segredos equivalentes nunca podem ser usados no frontend.
- Variáveis `VITE_*` são públicas no build.
- Segredos devem ser usados somente em backend, Edge Function ou ambiente protegido.
- O repositório não deve conter `.env` real.
- O CI deve verificar vazamento acidental de secrets.

### 5.3 Autenticação

Melhorias:

- exigir senha forte e confirmação de e-mail quando adequado;
- tratar sessão expirada;
- adicionar rate limit no login;
- oferecer recuperação de senha;
- registrar eventos de login relevantes;
- invalidar sessões em ações sensíveis;
- não usar e-mail fixo, papel vindo do cliente ou metadata editável para autorização;
- adicionar convite e gestão de membros para equipes.

### 5.4 Validação de entrada

A validação deve existir em três níveis:

1. interface, para feedback rápido;
2. camada de serviço, para consistência do cliente;
3. banco/RPC, como autoridade final.

Validar especialmente:

- nome e tamanho máximo de texto;
- preço, custo e margem;
- quantidades inteiras/fracionadas permitidas;
- limites de estoque;
- datas;
- identificadores UUID;
- payloads de RPC;
- campos opcionais e valores nulos.

### 5.5 Storage e avatar

Caso exista upload de avatar:

- aceitar somente MIME types permitidos;
- limitar tamanho;
- gerar nome seguro e não confiar no nome original;
- armazenar em caminho por usuário/organização;
- criar policies de leitura/escrita mínimas;
- exigir `SELECT`, `INSERT` e `UPDATE` para upsert;
- não permitir que um usuário sobrescreva arquivo de outro;
- remover arquivos antigos quando necessário;
- considerar imagem redimensionada e metadados removidos.

### 5.6 Cabeçalhos e navegador

No deploy, adicionar headers de defesa em profundidade:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Strict-Transport-Security` em HTTPS;
- `Permissions-Policy` desabilitando recursos não usados;
- `Content-Security-Policy-Report-Only` inicialmente e, depois de ajustar os relatórios, CSP aplicada;
- `X-Frame-Options` se a aplicação autenticada não precisar ser embutida.

Também revisar:

- foco visível;
- proteção contra ações repetidas;
- confirmação de exclusões;
- exposição de mensagens técnicas;
- logs sem tokens, e-mails desnecessários ou dados sensíveis.

---

## 6. Melhorias de UX/UI

### 6.1 Navegação

- substituir a navegação somente por estado por URLs reais;
- destacar a seção atual com texto e ícone;
- manter o contexto ao voltar do formulário;
- criar breadcrumbs em telas profundas;
- mostrar claramente a organização e o usuário atual;
- separar ações destrutivas das ações principais;
- adicionar busca global quando o catálogo crescer.

### 6.2 Dashboard

Priorizar decisões operacionais, não apenas gráficos:

- vendas do dia;
- faturamento;
- margem/lucro;
- produtos abaixo do mínimo;
- produtos sem movimentação;
- últimas vendas;
- comparação com período anterior;
- atalhos para registrar venda e repor estoque.

Cada indicador deve possuir período, unidade monetária e explicação acessível.

### 6.3 PDV

Fluxo recomendado:

1. busca rápida por nome, código ou categoria;
2. carrinho sempre visível;
3. quantidade editável com teclado;
4. alerta imediato de estoque insuficiente;
5. resumo de subtotal, desconto e total;
6. confirmação final com dados legíveis;
7. tela de sucesso com número da venda;
8. opção de nova venda sem perder foco.

Evitar enviar a venda repetidamente durante loading. Exibir estado de processamento e resultado real do servidor.

### 6.4 Estoque

- tabela com ordenação, filtros e paginação;
- badges para normal, baixo e crítico;
- edição inline somente quando isso não prejudicar clareza;
- histórico de movimentações;
- importação/exportação controlada;
- confirmação ao excluir;
- informação de última atualização;
- ações em lote com permissões adequadas.

### 6.5 Formulários

- labels persistentes, não apenas placeholders;
- mensagens próximas ao campo;
- máscara monetária sem alterar o valor real incorretamente;
- exemplos de unidade e formato;
- prevenção de perda de dados não salvos;
- validação ao sair e ao enviar;
- foco automático no primeiro erro;
- botões com estados `salvando`, `sucesso` e `erro`.

### 6.6 Estados da interface

Toda tela deve ter estados explícitos:

- carregando;
- vazio;
- erro recuperável;
- sem permissão;
- offline ou conexão instável;
- salvando;
- sucesso;
- dados desatualizados.

Um aviso de erro deve informar o que aconteceu, o que o usuário pode fazer e se a operação foi concluída ou não.

### 6.7 Acessibilidade

- navegação completa por teclado;
- foco visível;
- `aria-label` em botões apenas com ícone;
- modal com foco preso e Escape;
- contraste mínimo adequado;
- tabelas com cabeçalhos semânticos;
- notificações com `aria-live`;
- não depender apenas de cor para indicar estoque;
- suporte a zoom e telas menores.

### 6.8 Design system

Definir tokens para:

- cores de marca, sucesso, aviso, erro e informação;
- superfícies claras e escuras;
- bordas e estados de foco;
- tipografia;
- espaçamento;
- raios e sombras;
- tamanhos de controles.

Manter no máximo duas famílias tipográficas e uma paleta curta, consistente e acessível. O tema escuro deve ser revisado componente por componente, incluindo gráficos, tabelas e modais.

---

## 7. Qualidade, testes e confiabilidade

### Testes unitários

Cobrir:

- cálculo de margem e lucro;
- conversão de ML para garrafas;
- arredondamentos;
- limites de estoque;
- alertas mínimo/crítico;
- datas e timezone;
- validação de produtos e receitas.

### Testes de integração

Criar testes contra um ambiente Supabase de teste para:

- criar/editar/excluir produto;
- criar receita;
- autenticar e sair;
- registrar venda;
- vender com estoque insuficiente;
- executar duas vendas concorrentes;
- confirmar rollback quando uma parte falhar;
- confirmar RLS entre dois usuários e dois tenants;
- validar Storage.

### E2E

Fluxos essenciais:

1. login válido e inválido;
2. logout e limpeza do estado;
3. cadastro de produto;
4. baixa de estoque;
5. venda completa;
6. bloqueio de estoque insuficiente;
7. relatório filtrado;
8. erro de rede e tentativa novamente;
9. responsividade mobile.

### CI/CD

Pipeline mínimo:

```text
install congelado
→ lint
→ typecheck
→ testes unitários
→ testes de integração
→ build
→ auditoria de dependências
```

Toda migração deve ser revisada, executada em staging e ter plano de rollback.

---

## 8. Observabilidade e operação

Adicionar:

- logs estruturados no backend/RPC;
- correlação por request e venda;
- monitoramento de erros do frontend;
- alertas para falhas de RPC e autenticação;
- métricas de tempo de carregamento;
- auditoria de ações administrativas;
- health check do sistema;
- documentação de incidentes;
- backup e teste periódico de restauração.

Nunca registrar senha, token, service role, conteúdo sensível ou payloads completos sem necessidade.

---

## 9. LGPD e preparação comercial

Antes de comercializar:

- definir controlador, operador e finalidade dos dados;
- publicar política de privacidade;
- definir retenção e exclusão;
- permitir exportação quando aplicável;
- registrar consentimentos necessários;
- limitar acesso de suporte;
- manter trilha de auditoria;
- separar dados por cliente;
- documentar suboperadores e integrações;
- criar plano de resposta a incidentes.

Para planos pagos:

- organizações e membros;
- limites por plano;
- convite de equipe;
- cobrança e cancelamento;
- período de teste;
- bloqueio seguro por inadimplência;
- suporte e SLA;
- medição de uso.

Cobrança deve ser implementada somente depois que identidade, tenant e integridade de dados estiverem sólidos.

---

## 10. Roadmap recomendado

### Etapa 1 — Baseline e inventário

- confirmar schema real do Supabase;
- listar tabelas, policies, RPCs, views, triggers, índices e buckets;
- rodar build, lint e testes;
- revisar dependências;
- criar ambiente de staging;
- registrar riscos e critérios de aceite.

**Saída:** inventário técnico e matriz de riscos.

### Etapa 2 — Segurança do banco

- implementar/validar tenant;
- ativar RLS;
- corrigir policies;
- revisar funções e Storage;
- escrever testes de isolamento.

**Saída:** prova de que usuários não atravessam o limite de dados.

### Etapa 3 — Sessão e autorização

- centralizar autenticação;
- limpar estado no logout;
- tratar expiração;
- criar papéis e permissões;
- remover qualquer autorização baseada no cliente.

**Saída:** ciclo de sessão previsível e autorização verificável.

### Etapa 4 — Integridade operacional

- revisar RPC de venda;
- recalcular totais no banco;
- adicionar itens de venda e movimentos de estoque;
- tratar concorrência e idempotência;
- preservar snapshots históricos.

**Saída:** nenhuma venda parcial ou estoque inconsistente.

### Etapa 5 — UX/UI

- roteamento;
- estados de loading/erro/vazio;
- PDV otimizado;
- filtros e paginação;
- acessibilidade;
- design system consistente;
- responsividade mobile.

**Saída:** fluxo rápido e compreensível para operação diária.

### Etapa 6 — Testes e observabilidade

- testes unitários, integração e E2E;
- CI;
- logs e monitoramento;
- health checks;
- backup e restauração testados.

**Saída:** releases repetíveis e problemas detectáveis.

### Etapa 7 — Beta controlado

- selecionar poucos clientes;
- acompanhar erros e uso;
- medir tempo para primeira venda;
- coletar feedback;
- corrigir gargalos;
- documentar suporte.

**Saída:** evidência real antes de escalar.

### Etapa 8 — Comercialização

- planos e limites;
- cobrança;
- LGPD;
- onboarding;
- suporte;
- indicadores de retenção e conversão.

---

## 11. Matriz de prioridades

| Prioridade | Item | Risco se ignorado | Critério de conclusão |
|---|---|---|---|
| P0 | RLS e isolamento | Vazamento entre clientes | Teste negativo aprovado |
| P0 | RPC de venda | Fraude e estoque inconsistente | Totais recalculados no banco |
| P0 | Segredos | Comprometimento do projeto | Nenhum secret no bundle |
| P1 | Sessão única | Dados de usuário anterior | Logout limpa todo estado |
| P1 | Testes de integração | Regressões silenciosas | Fluxos críticos automatizados |
| P1 | Erros verdadeiros | Usuário acredita que salvou | Falha nunca mostra sucesso |
| P1 | Concorrência | Venda acima do estoque | Transação e lock testados |
| P2 | Roteamento | UX e compartilhamento ruins | Rotas protegidas funcionando |
| P2 | Paginação e filtros | Lentidão com crescimento | Listas suportam volume esperado |
| P2 | Acessibilidade | Exclusão de usuários | Auditoria básica aprovada |
| P2 | Observabilidade | Incidentes invisíveis | Alertas e logs úteis |
| P3 | Cobrança | Complexidade prematura | Segurança e beta validados |

---

## 12. Checklist de aceite para o próximo release

### Segurança

- [ ] RLS revisado no schema real.
- [ ] Teste de acesso cruzado entre tenants falha corretamente.
- [ ] Nenhuma chave secreta no cliente.
- [ ] Policies de Storage revisadas.
- [ ] Inputs validados no banco/RPC.
- [ ] Funções privilegiadas auditadas.

### Negócio

- [ ] Venda recalcula preço, custo e lucro no servidor.
- [ ] Estoque nunca fica negativo.
- [ ] Retry não duplica venda.
- [ ] Histórico possui referências estáveis.
- [ ] Datas exibem o período correto.

### Produto

- [ ] Login, logout e expiração funcionam.
- [ ] Loading, vazio e erro são claros.
- [ ] PDV pode ser usado com teclado.
- [ ] Mobile não perde ações essenciais.
- [ ] Acessibilidade básica aprovada.

### Engenharia

- [ ] Lint passa.
- [ ] Typecheck/build passam.
- [ ] Testes unitários passam.
- [ ] Integração e E2E críticas passam.
- [ ] Migração revisada em staging.
- [ ] Backup e restauração foram testados.
- [ ] Deploy pode ser revertido.

---

## 13. Conclusão

O Adega Control já possui uma base funcional e uma separação inicial saudável entre telas, regras de negócio, mapeadores e acesso ao Supabase. O maior trabalho restante não é apenas visual: é transformar o frontend em uma aplicação SaaS confiável, na qual o banco seja a autoridade de segurança e integridade.

A sequência mais segura é: **auditar o Supabase real, garantir isolamento e autorização, tornar vendas transacionais e server-side, consolidar sessão, automatizar testes e então elevar UX/UI e recursos comerciais**. Assim, as melhorias visuais aumentam o valor do produto sem mascarar riscos de dados ou de operação.

> Próximo passo recomendado: executar a Etapa 1 com inventário real do Supabase e transformar cada item da matriz de prioridades em uma issue rastreável.
