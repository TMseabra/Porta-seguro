/** Peças visuais partilhadas pelo ecrã da portaria (/portao-teste) e pela simulação do admin. */
import type { AlunoResumo } from "@/lib/movimento";
import type { TipoRegisto } from "@/lib/constantes";

/**
 * Foto do aluno ao lado do nome (RF17): o porteiro compara-a com a pessoa à frente. Sem foto, mostram-se
 * as iniciais, para não parecer uma imagem que não carregou.
 */
export function CartaoAluno({ aluno }: { aluno: AlunoResumo }) {
  return (
    <div className="flex items-center gap-3">
      {aluno.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={aluno.fotoUrl} alt={`Fotografia de ${aluno.nome}`} className="avatar" />
      ) : (
        <div aria-hidden className="avatar">
          {iniciais(aluno.nome)}
        </div>
      )}
      <div>
        <p className="font-bold">{aluno.nome}</p>
        {aluno.turma && <p className="subtitulo">{aluno.turma}</p>}
        {!aluno.fotoUrl && <p className="subtitulo">Sem fotografia no sistema</p>}
      </div>
    </div>
  );
}

/**
 * Estado da porta e horário do dia, para quem identifica ver se a pessoa devia estar ali. `tipo` vem de quem
 * chama: "há aula a decorrer" só quer dizer "chegou atrasado" numa entrada.
 */
export function EstadoPortaEHorario({ aluno, tipo }: { aluno: AlunoResumo; tipo: TipoRegisto }) {
  const estadoPorta = aluno.estadoPorta;
  if (!estadoPorta) return null;

  const blocosDeHoje = aluno.blocosHoje ?? [];

  return (
    <div>
      <p>
        <b>Porta {estadoPorta.estado === "aberta" ? "aberta" : "fechada"}</b>
        {estadoPorta.atrasado && tipo === "entrada" && " · Chegou atrasado"}
      </p>
      <p className="subtitulo">{estadoPorta.motivo}</p>
      {blocosDeHoje.length > 0 && (
        <ul className="lista subtitulo">
          {blocosDeHoje.map((bloco, indice) => (
            <li key={indice}>
              {bloco.horaInicio}–{bloco.horaFim} {bloco.disciplina}
              {bloco.sala ? ` (${bloco.sala})` : ""}
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
  return <div className={`aviso aviso-${cor}`}>{children}</div>;
}

export function BotaoResposta({
  onClick,
  disabled,
  principal = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  principal?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={principal ? "botao" : "botao-claro"}
    >
      {children}
    </button>
  );
}
