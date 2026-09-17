type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ title, description, confirmLabel, tone = 'danger', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" className="w-full max-w-md rounded-3xl border border-adega-border bg-adega-card p-6 text-adega-text shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold ${tone === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'}`} aria-hidden="true">
          {tone === 'danger' ? '!' : '?'}
        </div>
        <h3 id="confirm-dialog-title" className="text-xl font-bold">{title}</h3>
        <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-adega-muted">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-xl border border-adega-border px-4 py-3 font-bold text-adega-text hover:bg-adega-bg">Cancelar</button>
          <button type="button" onClick={onConfirm} className={`rounded-xl px-4 py-3 font-bold text-white ${tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
