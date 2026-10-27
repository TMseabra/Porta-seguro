import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Curso, Utilizador } from "@/models";
import { FormularioTurma } from "../formulario-turma";
import { criarTurma } from "../acoes";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaNovaTurma() {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const [cursos, diretores] = await Promise.all([
    Curso.find().select("nome").sort({ nome: 1 }).lean(),
    Utilizador.find({ perfil: "dt" }).select("nomeCompleto").sort({ nomeCompleto: 1 }).lean(),
  ]);

  return (
    <PaginaInterna titulo="Nova turma" voltarHref="/admin/turmas" voltarLabel="Turmas"
      estreita>
      <div className="cartao">
        <FormularioTurma
          acao={criarTurma}
          cursos={cursos.map((c) => ({ id: c._id.toString(), nome: c.nome }))}
          diretores={diretores.map((d) => ({ id: d._id.toString(), nome: d.nomeCompleto }))}
        />
      </div>
    </PaginaInterna>
  );
}
