import { ligarBaseDados } from "@/lib/mongoose";
import { formatarHora, diaDaSemanaEmLisboa } from "@/lib/datas";
import { Utilizador, Turma, Horario, Registo, Ocorrencia, TokenQR } from "@/models";
import type { IUtilizador, IHorario } from "@/models";
import {
  decidirEntrada,
  decidirSaida,
  calcularEstadoPorta,
  proximoTipoRegisto,
  type ResultadoEstadoPorta,
} from "@/lib/regras";
import { notificarMovimento } from "@/lib/notificacoes";
import type { BlocoHorario } from "@/components/horario-semanal";
import type { TipoRegisto, EstadoRegisto, MetodoRegisto } from "@/lib/constantes";

export interface AlunoResumo {
  id: string;
  nome: string;
  fotoUrl?: string;
  numeroAluno?: number;
  turma?: string;
  blocosHoje?: BlocoHorario[];
  estadoPorta?: ResultadoEstadoPorta;
}

export interface LinhaRegisto {
  id: string;
  alunoNome: string;
  tipo: TipoRegisto;
  estado: EstadoRegisto;
  metodo: MetodoRegisto;
  horaFormatada: string;
}

export type ResultadoMovimento =
  | { ok: false; erro: string }
  | {
      ok: true;
      pendente: false;
      aluno: AlunoResumo;
      autorizado: boolean;
      motivo: string;
      linha: LinhaRegisto;
    }
  | {
      ok: true;
      pendente: true;
      aluno: AlunoResumo;
      motivo: string;
      horarioId?: string;
      momentoISO: string;
      metodo: MetodoRegisto;
    };

export type AlunoParaMovimento = Pick<
  IUtilizador,
  | "_id"
  | "nomeCompleto"
  | "email"
  | "fotoUrl"
  | "numeroAluno"
  | "turmaId"
  | "maiorIdade"
  | "autorizacaoPais"
  | "suspenso"
>;

async function invalidarTokenQRPendente(alunoId: IUtilizador["_id"], momento: Date): Promise<void> {
  await TokenQR.updateMany({ alunoId, usado: false }, { usado: true, usadoEm: momento });
}

export function resumoDoAluno(
  aluno: AlunoParaMovimento,
  nomeTurma?: string,
  horarios?: IHorario[],
  momento?: Date,
): AlunoResumo {
  return {
    id: aluno._id.toString(),
    nome: aluno.nomeCompleto,
    fotoUrl: aluno.fotoUrl,
    numeroAluno: aluno.numeroAluno,
    turma: nomeTurma,
    blocosHoje:
      horarios && momento
        ? horarios
            .filter((h) => h.diaSemana === diaDaSemanaEmLisboa(momento))
            .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
            .map((h) => ({
              diaSemana: h.diaSemana,
              horaInicio: h.horaInicio,
              horaFim: h.horaFim,
              disciplina: h.disciplina,
              sala: h.sala,
            }))
        : undefined,
    estadoPorta:
      horarios && momento ? calcularEstadoPorta(horarios, momento) : undefined,
  };
}

export async function processarMovimento(
  aluno: AlunoParaMovimento,
  registadoPorId: string,
  metodo: MetodoRegisto,
  momento: Date,
  tipoForcado?: TipoRegisto,
): Promise<ResultadoMovimento> {
  await ligarBaseDados();

  const turma = aluno.turmaId ? await Turma.findById(aluno.turmaId).lean() : null;
  const horarios = aluno.turmaId
    ? await Horario.find({ turmaId: aluno.turmaId }).lean()
    : [];

  const resumo = resumoDoAluno(aluno, turma?.nome, horarios, momento);

  const ultimoRegisto = await Registo.findOne({ alunoId: aluno._id, dataHora: { $lt: momento } })
    .sort({ dataHora: -1 })
    .lean();
  const tipo = tipoForcado ?? proximoTipoRegisto(ultimoRegisto?.tipo);

  if (tipo === "entrada") {
    const decisao = decidirEntrada({ suspenso: aluno.suspenso }, horarios, momento);

    const registo = await Registo.create({
      alunoId: aluno._id,
      dataHora: momento,
      tipo: "entrada",
      metodo,
      estado: decisao.autorizado ? "autorizado" : "nao_autorizado",
      motivo: decisao.motivo,
      horarioId: decisao.horarioId,
      registadoPorId,
    });

    if (decisao.criarOcorrencia) {
      await Ocorrencia.create({
        alunoId: aluno._id,
        tipo: "entrada_suspenso",
        descricao: "Tentativa de entrada de aluno suspenso.",
        registoId: registo._id,
      });
    }

    await Promise.all([
      notificarMovimento(
        aluno.nomeCompleto,
        aluno.email,
        "entrada",
        decisao.autorizado,
        decisao.motivo,
        momento,
      ),
      invalidarTokenQRPendente(aluno._id, momento),
    ]);

    return {
      ok: true,
      pendente: false,
      aluno: resumo,
      autorizado: decisao.autorizado,
      motivo: decisao.motivo,
      linha: {
        id: registo._id.toString(),
        alunoNome: resumo.nome,
        tipo: "entrada",
        estado: registo.estado,
        metodo,
        horaFormatada: formatarHora(momento),
      },
    };
  }

  const decisao = decidirSaida(
    { maiorIdade: aluno.maiorIdade, autorizacaoPais: aluno.autorizacaoPais },
    horarios,
    momento,
  );

  if (!decisao.autorizado) {
    return {
      ok: true,
      pendente: true,
      aluno: resumo,
      motivo: decisao.motivo,
      horarioId: decisao.horarioId?.toString(),
      momentoISO: momento.toISOString(),
      metodo,
    };
  }

  const registo = await Registo.create({
    alunoId: aluno._id,
    dataHora: momento,
    tipo: "saida",
    metodo,
    estado: "autorizado",
    motivo: decisao.motivo,
    horarioId: decisao.horarioId,
    registadoPorId,
  });

  await Promise.all([
    notificarMovimento(aluno.nomeCompleto, aluno.email, "saida", true, decisao.motivo, momento),
    invalidarTokenQRPendente(aluno._id, momento),
  ]);

  return {
    ok: true,
    pendente: false,
    aluno: resumo,
    autorizado: true,
    motivo: decisao.motivo,
    linha: {
      id: registo._id.toString(),
      alunoNome: resumo.nome,
      tipo: "saida",
      estado: "autorizado",
      metodo,
      horaFormatada: formatarHora(momento),
    },
  };
}

export type ResultadoConfirmacao =
  | { ok: false; erro: string }
  | { ok: true; autorizado: boolean; linha: LinhaRegisto };

export async function confirmarSaidaComPais(
  alunoId: string,
  horarioId: string | undefined,
  momentoISO: string,
  metodo: MetodoRegisto,
  paisAutorizaram: boolean,
  registadoPorId: string,
): Promise<ResultadoConfirmacao> {
  await ligarBaseDados();

  const aluno = await Utilizador.findById(alunoId).lean();
  if (!aluno) {
    return { ok: false, erro: "Aluno já não existe." };
  }

  const momento = new Date(momentoISO);
  const motivo = paisAutorizaram
    ? "Saída fora do horário confirmada por telefone com os pais."
    : "Pais contactados; saída não autorizada.";

  const registo = await Registo.create({
    alunoId: aluno._id,
    dataHora: momento,
    tipo: "saida",
    metodo,
    estado: paisAutorizaram ? "confirmado_pais" : "nao_autorizado",
    motivo,
    horarioId,
    registadoPorId,
    confirmacaoPais: paisAutorizaram,
  });

  await Promise.all([
    notificarMovimento(aluno.nomeCompleto, aluno.email, "saida", paisAutorizaram, motivo, momento),
    invalidarTokenQRPendente(aluno._id, momento),
  ]);

  return {
    ok: true,
    autorizado: paisAutorizaram,
    linha: {
      id: registo._id.toString(),
      alunoNome: aluno.nomeCompleto,
      tipo: "saida",
      estado: registo.estado,
      metodo,
      horaFormatada: formatarHora(momento),
    },
  };
}
