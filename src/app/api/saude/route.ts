/** Diagnóstico (GET /api/saude): confirma a ligação ao Atlas e o deploy. Não faz parte dos requisitos. */

import { ligarBaseDados } from "@/lib/mongoose";
import { formatarDataHora } from "@/lib/datas";
import { auth } from "@/auth";

// Tem de ser Node.js: o Mongoose usa TCP, que o Edge não tem.
export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET() {
  const agora = new Date();

  // Responde a quem não tem sessão (confirma o deploy), mas nome da BD e servidor só vão para admins.
  const sessao = await auth();
  const eAdmin = sessao?.user?.perfil === "admin" || sessao?.user?.perfil === "gestor";

  try {
    const ligacao = await ligarBaseDados();

    if (!eAdmin) {
      return Response.json({ estado: "ok" });
    }

    return Response.json({
      estado: "ok",
      baseDados: ligacao.connection.name, // nome da base de dados ligada
      servidor: ligacao.connection.host,
      momento: formatarDataHora(agora), // já no fuso de Lisboa
    });
  } catch (erro) {
    // A mensagem do driver revela demasiado: fica no log do servidor e só é devolvida a um admin.
    console.error("Falha na ligação à base de dados:", erro);
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido.";

    return Response.json(
      {
        estado: "erro",
        ...(eAdmin ? { mensagem, momento: formatarDataHora(agora) } : {}),
      },
      { status: 500 },
    );
  }
}
