/**
 * Modelo de Excel para horários (RF10). Rota normal e não Server Action: um link direto é o que faz o
 * browser descarregar um ficheiro. A folha "Professores" existe porque o importador exige o nome
 * EXATAMENTE igual ao da conta.
 */
import * as XLSX from "xlsx";
import { ligarBaseDados } from "@/lib/mongoose";
import { exigirPerfil } from "@/lib/permissoes";
import { Utilizador, Turma } from "@/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const [professores, turmas] = await Promise.all([
    Utilizador.find({ perfil: { $in: ["professor", "dt"] } })
      .select("nomeCompleto")
      .sort({ nomeCompleto: 1 })
      .lean(),
    Turma.find().select("nome").sort({ nome: 1 }).lean(),
  ]);

  const livro = XLSX.utils.book_new();

  // Duas linhas de exemplo (a apagar) para se perceber cada coluna.
  const linhasExemplo = [
    ["Dia", "Início", "Fim", "Disciplina", "Professor", "Sala"],
    ["Segunda-feira", "08:30", "10:00", "Programação", professores[0]?.nomeCompleto ?? "", "1.12"],
    ["Segunda-feira", "10:15", "11:45", "Matemática", professores[1]?.nomeCompleto ?? "", "1.08"],
  ];
  const folhaHorario = XLSX.utils.aoa_to_sheet(linhasExemplo);
  folhaHorario["!cols"] = [
    { wch: 14 }, // Dia
    { wch: 9 }, // Início
    { wch: 9 }, // Fim
    { wch: 22 }, // Disciplina
    { wch: 26 }, // Professor
    { wch: 8 }, // Sala
  ];
  XLSX.utils.book_append_sheet(livro, folhaHorario, "Horário");

  // Folha de consulta: nomes exatos dos professores e das turmas; o importador não a lê.
  const linhasInstrucoes = [
    ["Como preencher a folha \"Horário\"", ""],
    ["", ""],
    ["1. Uma linha por bloco de aula (ex.: uma turma com 5 blocos por semana = 5 linhas).", ""],
    ["2. \"Dia\": nome (Segunda-feira) ou número de 0 a 6 (0 = domingo, 1 = segunda...).", ""],
    ["3. \"Início\" e \"Fim\": formato HH:MM, sempre com dois dígitos (08:30, não 8:30).", ""],
    ["4. \"Professor\" é opcional, mas se preenchido tem de ser IGUAL ao nome completo", ""],
    ["   de uma conta já criada no sistema — ver a lista abaixo.", ""],
    ["5. \"Sala\" é opcional, texto livre.", ""],
    ["6. Uma folha Excel destas serve UMA turma. Para várias turmas, um ficheiro", ""],
    ["   por turma (ou uma folha por turma — o importador só lê a primeira folha).", ""],
    ["7. A importação SUBSTITUI todo o horário da turma escolhida — confirma sempre", ""],
    ["   a pré-visualização antes de confirmar.", ""],
    ["", ""],
    ["Turmas já criadas", "Professores (nome exato a copiar)"],
    ...Array.from(
      { length: Math.max(turmas.length, professores.length, 1) },
      (_, indice) => [turmas[indice]?.nome ?? "", professores[indice]?.nomeCompleto ?? ""],
    ),
  ];
  const folhaInstrucoes = XLSX.utils.aoa_to_sheet(linhasInstrucoes);
  folhaInstrucoes["!cols"] = [{ wch: 60 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(livro, folhaInstrucoes, "Instruções");

  const bytes = XLSX.write(livro, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modelo-horario-portaoseguro.xlsx"',
    },
  });
}
