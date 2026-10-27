import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Turma } from "@/models";
import { FormularioAluno } from "../formulario-aluno";
import { criarAluno } from "../acoes";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaNovoAluno() {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const turmas = await Turma.find().select("nome").sort({ nome: 1 }).lean();

  return (
    <PaginaInterna titulo="Novo aluno" voltarHref="/admin/alunos" voltarLabel="Alunos"
      estreita>
      <div className="cartao">
        <FormularioAluno
          acao={criarAluno}
          turmas={turmas.map((t) => ({ id: t._id.toString(), nome: t.nome }))}
        />
      </div>
    </PaginaInterna>
  );
}
