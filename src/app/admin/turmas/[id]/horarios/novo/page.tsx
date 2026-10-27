import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Utilizador } from "@/models";
import { FormularioHorario } from "../formulario-horario";
import { criarHorario } from "../acoes";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaNovoHorario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();
  const { id: turmaId } = await params;

  const professores = await Utilizador.find({ perfil: { $in: ["professor", "dt"] } })
    .select("nomeCompleto")
    .sort({ nomeCompleto: 1 })
    .lean();

  return (
    <PaginaInterna
      titulo="Novo bloco de horário"
      voltarHref={`/admin/turmas/${turmaId}`}
      voltarLabel="Editar turma"
      estreita>
      <div className="cartao">
        <FormularioHorario
          acao={criarHorario}
          turmaId={turmaId}
          professores={professores.map((p) => ({ id: p._id.toString(), nome: p.nomeCompleto }))}
        />
      </div>
    </PaginaInterna>
  );
}
