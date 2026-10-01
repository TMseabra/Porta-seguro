import { exigirPerfil } from "@/lib/permissoes";
import { diaDaSemanaEmLisboa } from "@/lib/datas";
import { HorarioSemanal } from "@/components/horario-semanal";
import { TituloPagina, Cartao } from "../shell";
import { horarioDoAluno } from "../dados-aluno";

export default async function PaginaHorario() {
  const sessao = await exigirPerfil(["aluno"]);
  const { turma, blocos } = await horarioDoAluno(sessao.user.id);

  return (
    <>
      <TituloPagina
        titulo="O meu horário"
        descricao={turma?.nome ? `Horário semanal da turma ${turma.nome}.` : undefined}
      />
      <Cartao>
        {turma ? (
          <HorarioSemanal blocos={blocos} diaEmDestaque={diaDaSemanaEmLisboa(new Date())} mostrarProfessor tamanhoGrande />
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Ainda não tens turma atribuída.</p>
        )}
      </Cartao>
    </>
  );
}
