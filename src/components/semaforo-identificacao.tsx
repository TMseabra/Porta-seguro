/** Peças visuais partilhadas pelo ecrã da portaria (/portao-teste) e pela simulação do admin. */
import type { AlunoResumo } from "@/lib/movimento";
import type { TipoRegisto } from "@/lib/constantes";

/**
 * Foto do aluno ao lado do nome (RF16): o porteiro compara-a com a pessoa à frente. Sem foto, mostram-se
 * as iniciais e "Sem fotografia", para não parecer uma imagem que não carregou.
 */
export function CartaoAluno({ aluno }: { aluno: AlunoResumo }) {
  return (
    <div className="flex items-center gap-3">
      {aluno.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={aluno.fotoUrl}
          alt={`Fotografia de ${aluno.nome}`}
          className="h-16 w-16 shrink-0 rounded-full border object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black/10 text-lg font-semibold dark:bg-white/15"
        >
          {iniciais(aluno.nome)}
        </div>
      )}
      <div>
        <p className="text-lg font-semibold">{aluno.nome}</p>
        {aluno.turma && <p className="text-sm opacity-70">{aluno.turma}</p>}
        {!aluno.fotoUrl && <p className="text-xs opacity-60">Sem fotografia no sistema</p>}
      </div>
    </div>
  );
}

/**
 * Estado da porta e horário do dia, para quem identifica ver se a pessoa devia estar ali (sem histórico
 * de faltas). `tipo` vem de quem chama: estadoPorta é só um facto de horário; é o tipo que decide se
 * "há aula a decorrer" quer dizer "chegou atrasado" (só numa entrada) ou nada de especial (numa saída).
 */
export function EstadoPortaEHorario({ aluno, tipo }: { aluno: AlunoResumo; tipo: TipoRegisto }) {
  const estadoPorta = aluno.estadoPorta;
  if (!estadoPorta) return null;

  const aberta = estadoPorta.estado === "aberta";
  // Já filtrados e ordenados pelo servidor, para o dia do momento (real ou simulado).
  const blocosDeHoje = aluno.blocosHoje ?? [];

  return (
    <div className="mt-4 flex flex-col gap-1.5 border-t border-black/10 pt-3 dark:border-white/10">
      <p className="flex flex-wrap items-center gap-2 font-semibold">
        <span
          aria-hidden
          className={`inline-block h-3.5 w-3.5 rounded-full ${
            aberta ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
        Porta {aberta ? "aberta" : "fechada"}
        {estadoPorta.atrasado && tipo === "entrada" && (
          <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            Chegou atrasado
          </span>
        )}
      </p>
      <p className="text-sm opacity-80">{estadoPorta.motivo}</p>

      {blocosDeHoje.length > 0 && (
        <ul className="mt-1 flex flex-col gap-0.5 text-xs opacity-70">
          {blocosDeHoje.map((bloco, indice) => (
            <li key={indice} className="flex gap-2">
              <span className="font-mono tabular-nums">
                {bloco.horaInicio}–{bloco.horaFim}
              </span>
              <span>{bloco.disciplina}</span>
              {bloco.sala && <span>{bloco.sala}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

export function Semaforo({
  cor,
  children,
}: {
  cor: "verde" | "vermelho" | "amarelo";
  children: React.ReactNode;
}) {
  const cores = {
    verde: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
    vermelho: "border-red-500 bg-red-50 dark:bg-red-950",
    amarelo: "border-amber-500 bg-amber-50 dark:bg-amber-950",
  };

  return <div className={`rounded-2xl border-l-4 p-5 ${cores[cor]}`}>{children}</div>;
}

export function BotaoResposta({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-transparent dark:hover:bg-white/10"
    >
      {children}
    </button>
  );
}
