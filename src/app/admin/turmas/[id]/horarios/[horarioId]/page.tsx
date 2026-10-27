import { notFound } from "next/navigation";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Horario, Utilizador } from "@/models";
import { FormularioHorario } from "../formulario-horario";
import { atualizarHorario } from "../acoes";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaEditarHorario({
  params,
}: {
  params: Promise<{ id: string; horarioId: string }>;
}) {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();
  const { id: turmaId, horarioId } = await params;

  const [horario, professores] = await Promise.all([
    Horario.findById(horarioId).lean(),
    Utilizador.find({ perfil: { $in: ["professor", "dt"] } })
      .select("nomeCompleto")
      .sort({ nomeCompleto: 1 })
      .lean(),
  ]);

  if (!horario) notFound();

  return (
    <PaginaInterna
      titulo="Editar bloco de horário"
      voltarHref={`/admin/turmas/${turmaId}`}
      voltarLabel="Editar turma"
      estreita>
      <div className="cartao">
        <FormularioHorario
          acao={atualizarHorario}
          turmaId={turmaId}
          professores={professores.map((p) => ({ id: p._id.toString(), nome: p.nomeCompleto }))}
          horarioInicial={{
            id: horario._id.toString(),
            diaSemana: horario.diaSemana,
            horaInicio: horario.horaInicio,
            horaFim: horario.horaFim,
            disciplina: horario.disciplina,
            professorId: horario.professorId?.toString(),
            sala: horario.sala,
          }}
        />
      </div>
    </PaginaInterna>
  );
}
