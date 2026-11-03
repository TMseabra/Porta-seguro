import { ligarBaseDados } from "@/lib/mongoose";
import { formatarDataHora } from "@/lib/datas";
import { auth } from "@/auth";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET() {
  const agora = new Date();

  const sessao = await auth();
  const eAdmin = sessao?.user?.perfil === "admin" || sessao?.user?.perfil === "gestor";

  try {
    const ligacao = await ligarBaseDados();

    if (!eAdmin) {
      return Response.json({ estado: "ok" });
    }

    return Response.json({
      estado: "ok",
      baseDados: ligacao.connection.name,
      servidor: ligacao.connection.host,
      momento: formatarDataHora(agora),
    });
  } catch (erro) {
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
