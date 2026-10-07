/**
 * Relatório em PDF (RF11/UC04). Rota normal e não Server Action: um link direto é o que faz o browser
 * descarregar. Só admin e coordenador, com a mesma verificação de âmbito (senão bastava trocar o `alvo`
 * no endereço).
 */
import { exigirPerfil } from "@/lib/permissoes";
import { calcularResultadoConsulta, podeConsultar, ambitoValido } from "@/app/consultas/logica";
import { gerarPDFRelatorio } from "./gerarPDF";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sessao = await exigirPerfil(["coordenador", "gestor", "admin"]);

  const { searchParams } = new URL(request.url);
  const ambito = searchParams.get("ambito");
  const alvo = searchParams.get("alvo");
  const mes = searchParams.get("mes");

  if (!ambitoValido(ambito) || !alvo || !mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return new Response("Parâmetros em falta ou inválidos.", { status: 400 });
  }

  if (!(await podeConsultar(sessao.user.id, sessao.user.perfil, ambito, alvo))) {
    return new Response("Não tens acesso a esses dados.", { status: 403 });
  }

  const resultado = await calcularResultadoConsulta(ambito, alvo, mes);
  if (!resultado.ok) {
    return new Response(resultado.erro, { status: 404 });
  }

  const bytesPDF = await gerarPDFRelatorio(resultado, mes);

  return new Response(new Uint8Array(bytesPDF), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="assiduidade-${ambito}-${mes}.pdf"`,
    },
  });
}
