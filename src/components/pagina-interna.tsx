import { BarraTopo } from "@/components/barra-topo";

export function PaginaInterna({
  titulo,
  subtitulo,
  voltarHref,
  voltarLabel,
  acao,
  estreita = false,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  voltarHref: string;
  voltarLabel: string;
  acao?: React.ReactNode;
  estreita?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <BarraTopo titulo={`PortãoSeguro — ${titulo}`} voltar={{ href: voltarHref, texto: `← ${voltarLabel}` }} comSair />

      <main className={estreita ? "pagina pagina-estreita" : "pagina"}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1>{titulo}</h1>
            {subtitulo && <p className="subtitulo">{subtitulo}</p>}
          </div>
          {acao}
        </div>
        <div className="empilhado">{children}</div>
      </main>
    </div>
  );
}
