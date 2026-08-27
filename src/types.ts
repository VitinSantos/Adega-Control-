// Tipos centrais usados em todo o sistema
export interface Produto {
  id: string; nome: string; qtd: number; preco: number; precoCusto: number;
  mlPorGarrafa: number; alertaMinimo: number;
}
export interface Ingrediente { produtoId: string; nome: string; tipo: 'ML' | 'Unidade'; qtd: number; }
export interface Receita { id: string; nome: string; preco: number; ingredientes: Ingrediente[]; }
export interface Venda { id: string; nome: string; preco: number; custo: number; lucro: number; data: string; dataHoraISO: string; quantidade?: number; }
export type TipoNotificacao = 'aviso' | 'erro';
export interface Notificacao { id: string; mensagem: string; tipo: TipoNotificacao; }
export interface SessaoTenant { id: string; email?: string; nome?: string; tenantId: string; cargo?: string; }

export function tenantIdDoUsuario(user: { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null): string | null {
  const metadata = user?.app_metadata ?? user?.user_metadata;
  const tenantId = metadata?.tenant_id;
  return typeof tenantId === 'string' && tenantId.length > 0 ? tenantId : null;
}
