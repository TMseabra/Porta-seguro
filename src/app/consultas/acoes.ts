"use server";

import { exigirPerfil } from "@/lib/permissoes";
import {
  calcularResultadoConsulta,
  podeConsultar,
  ambitoValido,
  type Ambito,
  type ResultadoConsulta,
} from "./logica";

/**
 * UC02. Só admin e coordenador (o porteiro não acompanha faltas). O âmbito verifica-se aqui no servidor:
 * o id da turma vem do browser e podia ser trocado.
 */
export async function consultarAssiduidade(
  ambito: Ambito,
  alvo: string,
  mes: string,
): Promise<ResultadoConsulta> {
  const sessao = await exigirPerfil(["coordenador", "gestor", "admin"]);

  if (!ambitoValido(ambito)) {
    return { ok: false, erro: "Âmbito inválido." };
  }
  if (!alvo) {
    return { ok: false, erro: "Escolhe um aluno, turma ou ano de formação." };
  }
  if (!/^\d{4}-\d{2}$/.test(mes)) {
    return { ok: false, erro: "Escolhe um mês válido." };
  }

  if (!(await podeConsultar(sessao.user.id, sessao.user.perfil, ambito, alvo))) {
    return { ok: false, erro: "Não tens acesso a esses dados." };
  }

  return calcularResultadoConsulta(ambito, alvo, mes);
}
