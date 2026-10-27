import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Utilizador, Turma } from "@/models";
import { PaginaInterna } from "@/components/pagina-interna";
import { FormularioSimulacao, type AlunoParaSeletor } from "./formulario-simulacao";

/** Simulação de data/hora (admin/gestor) para a defesa oral; os registos ficam marcados como simulação. */
export default async function PaginaSimulacao() {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const alunos = await Utilizador.find({ perfil: "aluno" })
    .select("nomeCompleto turmaId")
    .sort({ nomeCompleto: 1 })
    .lean();
  const turmas = await Turma.find().select("nome").lean();
  const nomeTurmaPorId = new Map(turmas.map((t) => [t._id.toString(), t.nome]));

  const alunosParaSeletor: AlunoParaSeletor[] = alunos.map((aluno) => ({
    id: aluno._id.toString(),
    nome: aluno.nomeCompleto,
    turma: aluno.turmaId ? nomeTurmaPorId.get(aluno.turmaId.toString()) : undefined,
  }));

  return (
    <PaginaInterna
      titulo="Simulação de data/hora"
      subtitulo="Só para demonstração — não é uma entrada/saída real"
      voltarHref="/admin"
      voltarLabel="Administração">
      <p className="aviso aviso-amarelo mb-4">
        Esta ferramenta aplica as mesmas regras do Portão Teste (horário da
        turma, atrasos, suspensões, autorização de saída), mas à data e
        hora que escolheres, em vez do momento real. Os registos criados
        aqui ficam marcados como <strong>Simulação</strong> e nunca contam
        para a assiduidade real de nenhum aluno.
      </p>

      <FormularioSimulacao alunos={alunosParaSeletor} />
    </PaginaInterna>
  );
}
