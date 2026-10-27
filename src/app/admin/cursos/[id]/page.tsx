import { notFound } from "next/navigation";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Curso, Utilizador } from "@/models";
import { FormularioCurso } from "../formulario-curso";
import { atualizarCurso } from "../acoes";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaEditarCurso({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();
  const { id } = await params;

  const [curso, coordenadores] = await Promise.all([
    Curso.findById(id).lean(),
    Utilizador.find({ perfil: "coordenador" }).select("nomeCompleto").sort({ nomeCompleto: 1 }).lean(),
  ]);

  if (!curso) notFound();

  return (
    <PaginaInterna titulo="Editar curso" voltarHref="/admin/cursos" voltarLabel="Cursos"
      estreita>
      <div className="cartao">
        <FormularioCurso
          acao={atualizarCurso}
          coordenadores={coordenadores.map((c) => ({ id: c._id.toString(), nome: c.nomeCompleto }))}
          cursoInicial={{
            id: curso._id.toString(),
            nome: curso.nome,
            sigla: curso.sigla,
            anosDuracao: curso.anosDuracao,
            coordenadorId: curso.coordenadorId?.toString(),
          }}
        />
      </div>
    </PaginaInterna>
  );
}
