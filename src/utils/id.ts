export function gerarId(): string {
  // crypto.randomUUID existe em todos navegadores modernos (contexto seguro/HTTPS)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback simples caso randomUUID não esteja disponível
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
