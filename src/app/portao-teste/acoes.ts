"use server";

import { ligarBaseDados } from "@/lib/mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { Utilizador, Turma, Horario, Registo, Ocorrencia, TokenQR } from "@/models";
import type { ITokenQR } from "@/models";
import {
  validarTokenQR,
  tipoEsperadoNaLeitura,
  tipoForcadoNoMovimento,
  encontrarBlocoADecorrer,
} from "@/lib/regras";
import type { MetodoRegisto, TipoRegisto } from "@/lib/constantes";
import {
  processarMovimento,
  confirmarSaidaComPais as confirmarSaidaComPaisPartilhado,
  resumoDoAluno,
  type AlunoResumo,
  type LinhaRegisto,
  type ResultadoMovimento,
  type ResultadoConfirmacao,
} from "@/lib/movimento";

export type { AlunoResumo, LinhaRegisto, ResultadoConfirmacao };
export type ResultadoIdentificacao = ResultadoMovimento;

/** Quem, quando e como vêm do código na BD, nunca do browser. */
interface ContextoDoCodigo {
  tokenQR: ITokenQR;
  momento: Date;
  metodo: MetodoRegisto;
}

async function contextoDoCodigo(
  idToken: string,
): Promise<{ ok: true; contexto: ContextoDoCodigo } | { ok: false; erro: string }> {
  const tokenQR = await TokenQR.findById(idToken);
  if (!tokenQR) {
    return { ok: false, erro: "Código QR não reconhecido." };
  }
  if (tokenQR.movimentoRegistadoEm) {
    return { ok: false, erro: "Este código já deu origem a um movimento." };
  }

  return {
    ok: true,
    contexto: {
      tokenQR,
      momento: tokenQR.momentoSimulado ?? tokenQR.usadoEm ?? new Date(),
      metodo: tokenQR.momentoSimulado ? "simulacao" : "qr",
    },
  };
}

export async function confirmarSaidaComPais(
  idToken: string,
  paisAutorizaram: boolean,
): Promise<ResultadoConfirmacao> {
  const sessao = await exigirPerfil(["porteiro", "admin"]);
  await ligarBaseDados();

  const resultado = await contextoDoCodigo(idToken);
  if (!resultado.ok) return resultado;
  const { tokenQR, momento, metodo } = resultado.contexto;

  const aluno = await Utilizador.findById(tokenQR.alunoId).select("turmaId").lean();
  if (!aluno) {
    return { ok: false, erro: "Aluno já não existe." };
  }

  const horarios = aluno.turmaId ? await Horario.find({ turmaId: aluno.turmaId }).lean() : [];
  const bloco = encontrarBlocoADecorrer(horarios, momento);

  const confirmacao = await confirmarSaidaComPaisPartilhado(
    tokenQR.alunoId.toString(),
    bloco?._id.toString(),
    momento.toISOString(),
    metodo,
    paisAutorizaram,
    sessao.user.id,
  );

  if (confirmacao.ok) {
    await TokenQR.updateOne({ _id: tokenQR._id }, { movimentoRegistadoEm: new Date() });
  }
  return confirmacao;
}

export type ResultadoLeituraQR =
  | { ok: false; erro: string }
  | {
      ok: true;
      confirmarIdentidade: true;
      aluno: AlunoResumo;
      tipo: TipoRegisto;
      idToken: string;
    };

export async function lerCodigoQR(token: string): Promise<ResultadoLeituraQR> {
  await exigirPerfil(["porteiro", "admin"]);
  await ligarBaseDados();

  const tokenQR = await TokenQR.findOne({ token: token.trim() }).lean();
  if (!tokenQR) {
    return { ok: false, erro: "Código QR não reconhecido." };
  }

  const momento = new Date();
  const momentoDecisao = tokenQR.momentoSimulado ?? momento;

  const ultimoRegisto = await Registo.findOne({
    alunoId: tokenQR.alunoId,
    dataHora: { $lt: momentoDecisao },
  })
    .sort({ dataHora: -1 })
    .lean();
  const metodoDoCodigo: MetodoRegisto = tokenQR.momentoSimulado ? "simulacao" : "qr";
  const tipoEsperado = tipoEsperadoNaLeitura(tokenQR, metodoDoCodigo, ultimoRegisto?.tipo);

  const validacao = validarTokenQR(tokenQR, tokenQR.alunoId, tipoEsperado, momento);

  if (!validacao.valido) {
    await Ocorrencia.create({
      alunoId: tokenQR.alunoId,
      tipo: `qr_${validacao.motivo}`,
      descricao: `Tentativa de utilizar um código QR ${validacao.motivo.replace("_", " ")}.`,
    });

    const mensagem =
      validacao.motivo === "tipo_incorreto"
        ? `Este código só serve para ${tokenQR.tipo === "entrada" ? "entrar" : "sair"}.`
        : MENSAGENS_QR_INVALIDO[validacao.motivo];
    return { ok: false, erro: mensagem };
  }

  await TokenQR.updateOne({ _id: tokenQR._id }, { usado: true, usadoEm: momento });

  const aluno = await Utilizador.findById(tokenQR.alunoId).lean();
  if (!aluno) {
    return { ok: false, erro: "O aluno deste código já não existe." };
  }

  const [turma, horarios] = await Promise.all([
    aluno.turmaId ? Turma.findById(aluno.turmaId).lean() : null,
    aluno.turmaId ? Horario.find({ turmaId: aluno.turmaId }).lean() : [],
  ]);

  return {
    ok: true,
    confirmarIdentidade: true,
    aluno: resumoDoAluno(aluno, turma?.nome, horarios, momentoDecisao),
    tipo: tokenQR.tipo,
    idToken: tokenQR._id.toString(),
  };
}

const MENSAGENS_QR_INVALIDO = {
  aluno_diferente: "Este código QR não pertence a este aluno.",
  ja_utilizado: "Este código QR já foi utilizado.",
  expirado: "Este código QR já expirou.",
} as const;

export type ResultadoConfirmacaoIdentidade =
  | { ok: false; erro: string }
  | { ok: true; identidadeRejeitada: true; aluno: AlunoResumo; motivo: string }
  | ResultadoIdentificacao;

export async function confirmarIdentidadeQR(
  idToken: string,
  eEsteAluno: boolean,
): Promise<ResultadoConfirmacaoIdentidade> {
  const sessao = await exigirPerfil(["porteiro", "admin"]);
  await ligarBaseDados();

  const resultado = await contextoDoCodigo(idToken);
  if (!resultado.ok) return resultado;
  const { tokenQR, momento, metodo } = resultado.contexto;

  const aluno = await Utilizador.findById(tokenQR.alunoId).lean();
  if (!aluno) {
    return { ok: false, erro: "Aluno já não existe." };
  }

  if (!eEsteAluno) {
    await Ocorrencia.create({
      alunoId: aluno._id,
      tipo: "qr_aluno_diferente",
      descricao: "Porteiro confirmou que a pessoa presente não é o aluno do código QR.",
    });
    return {
      ok: true,
      identidadeRejeitada: true,
      aluno: resumoDoAluno(aluno),
      motivo: "Código QR não corresponde a quem se apresentou.",
    };
  }

  const movimento = await processarMovimento(
    aluno,
    sessao.user.id,
    metodo,
    momento,
    tipoForcadoNoMovimento(tokenQR, metodo),
  );

  if (movimento.ok && !movimento.pendente) {
    await TokenQR.updateOne({ _id: tokenQR._id }, { movimentoRegistadoEm: new Date() });
  }

  return movimento;
}
