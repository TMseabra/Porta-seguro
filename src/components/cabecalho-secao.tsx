import Link from "next/link";
import { Logo } from "@/components/logo";

/** Cabeçalho das páginas internas (logótipo, título, voltar), extraído para não repetir HTML. */
export function CabecalhoSecao({
  titulo,
  subtitulo,
  voltarHref,
  voltarLabel,
  acao,
}: {
  titulo: string;
  subtitulo?: string;
  voltarHref: string;
  voltarLabel: string;
  acao?: React.ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 bg-blue-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <h1 className="font-semibold">{titulo}</h1>
            {subtitulo && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitulo}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {acao}
          <Link
            href={voltarHref}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            ← {voltarLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
