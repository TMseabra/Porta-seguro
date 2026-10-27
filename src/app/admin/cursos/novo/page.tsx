import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Utilizador } from "@/models";
import { FormularioCurso } from "../formulario-curso";
import { criarCurso } from "../acoes";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaNovoCurso() {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const coordenadores = await Utilizador.find({ perfil: "coordenador" })
    .select("nomeCompleto")
    .sort({ nomeCompleto: 1 })
    .lean();

  return (
    <PaginaInterna titulo="Novo curso" voltarHref="/admin/cursos" voltarLabel="Cursos"
      estreita>
      <div className="cartao">
        <FormularioCurso
          acao={criarCurso}
          coordenadores={coordenadores.map((c) => ({ id: c._id.toString(), nome: c.nomeCompleto }))}
        />
      </div>
    </PaginaInterna>
  );
}
