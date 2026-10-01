/**
 * Mostrado de imediato ao clicar num item do menu, enquanto a página nova
 * vai buscar os dados à base de dados. Sem isto, o clique parecia não fazer
 * nada até a página inteira estar pronta.
 */
export default function CarregarPainel() {
  return (
    <div role="status" aria-label="A carregar" className="flex animate-pulse flex-col gap-6">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-white/[.06]" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-200 dark:bg-white/[.04]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0c1118]" />
        ))}
      </div>
      <span className="sr-only">A carregar…</span>
    </div>
  );
}
