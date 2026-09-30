/**
 * Dados partilhados pelas páginas do aluno em /painel/*. Não é "use server"
 * de propósito: são funções chamadas por páginas do servidor, não ações que
 * o browser possa chamar. O id do aluno vem sempre da sessão — nunca do
 * endereço — por isso ninguém consegue pedir os dados de outra pessoa.
 */
import QRCode from "qrcode";
import { headers } from "next/headers";
import { ligarBaseDados } from "@/lib/mongoose";
import { ehUserAgentDeTelemovel, EMAIL_CONTA_DE_TESTE_QR } from "@/lib/dispositivo";
import { TokenQR, Utilizador, Horario, Turma } from "@/models";
import type { TokenGerado } from "@/app/area-pessoal/acoes";
import type { BlocoHorario } from "@/components/horario-semanal";

/** Se já houver um código válido (ex.: a página foi atualizada), mostra
 * esse, em vez de obrigar a gerar outro. */
export async function tokenInicialDoAluno(alunoId: string): Promise<TokenGerado | null> {
  await ligarBaseDados();
  const token = await TokenQR.findOne({ alunoId, usado: false, validoAte: { $gt: new Date() } }).lean();
  if (!token) return null;
  return {
    id: token._id.toString(),
    validoAteISO: token.validoAte.toISOString(),
    imagemDataUrl: await QRCode.toDataURL(token.token, { margin: 1, width: 240 }),
    tipo: token.tipo,
  };
}

/** RF15: o código gera-se no telemóvel — só a conta de teste gera no PC. */
export async function permissoesQR(email?: string | null) {
  const userAgent = (await headers()).get("user-agent");
  const ehContaDeTeste = email === EMAIL_CONTA_DE_TESTE_QR;
  return { podeGerar: ehUserAgentDeTelemovel(userAgent) || ehContaDeTeste, podeEscolherHora: ehContaDeTeste };
}

/** Turma e horário do aluno, já com o nome do professor de cada aula (e
 * só isso — nenhuma outra informação sobre o professor). */
export async function horarioDoAluno(alunoId: string) {
  await ligarBaseDados();
  const aluno = await Utilizador.findById(alunoId).select("turmaId").lean();
  if (!aluno?.turmaId) return { turma: null, horarios: [], blocos: [] as BlocoHorario[] };

  const [turma, horarios] = await Promise.all([
    Turma.findById(aluno.turmaId).select("nome").lean(),
    Horario.find({ turmaId: aluno.turmaId }).sort({ diaSemana: 1, horaInicio: 1 }).lean(),
  ]);

  const ids = [...new Set(horarios.map((h) => h.professorId?.toString()).filter((id): id is string => Boolean(id)))];
  const professores = ids.length ? await Utilizador.find({ _id: { $in: ids } }).select("nomeCompleto").lean() : [];
  const nomePorId = new Map(professores.map((p) => [p._id.toString(), p.nomeCompleto]));

  const blocos: BlocoHorario[] = horarios.map((h) => ({
    diaSemana: h.diaSemana,
    horaInicio: h.horaInicio,
    horaFim: h.horaFim,
    disciplina: h.disciplina,
    sala: h.sala,
    professor: h.professorId ? nomePorId.get(h.professorId.toString()) : undefined,
  }));

  return { turma, horarios, blocos };
}
