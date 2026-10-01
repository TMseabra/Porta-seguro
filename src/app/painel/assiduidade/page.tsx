import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Registo } from "@/models";
import { limitesDoMesEmLisboa, partesEmLisboa, formatarData, formatarHora } from "@/lib/datas";
import { calcularAssiduidade, type RegistoParaAssiduidade } from "@/lib/relatorios/calcularAssiduidade";
import { AssiduidadeMensal, type LinhaDiaAssinalar } from "@/app/area-pessoal/assiduidade-mensal";
import { TituloPagina } from "../shell";
import { horarioDoAluno } from "../dados-aluno";

export default async function PaginaAssiduidade() {
  const sessao = await exigirPerfil(["aluno"]);
  await ligarBaseDados();

  const { ano, mes } = partesEmLisboa(new Date());
  const periodo = limitesDoMesEmLisboa(ano, mes);

  const [{ horarios }, registos] = await Promise.all([
    horarioDoAluno(sessao.user.id),
    // Registos de simulação do admin nunca contam como presença/falta real.
    Registo.find({
      alunoId: sessao.user.id,
      dataHora: { $gte: periodo.inicio, $lt: periodo.fim },
      metodo: { $ne: "simulacao" },
    })
      .select("tipo estado dataHora horarioId")
      .lean(),
  ]);

  const assiduidade = calcularAssiduidade(horarios, registos as RegistoParaAssiduidade[], periodo);

  const diasAssinalar: LinhaDiaAssinalar[] = assiduidade.dias
    .filter((dia): dia is typeof dia & { situacao: "presenca_atraso" | "falta" } => dia.situacao !== "presenca")
    .map((dia) => ({
      dataFormatada: formatarData(dia.data),
      situacao: dia.situacao,
      horaEntradaFormatada: dia.horaEntrada ? formatarHora(dia.horaEntrada) : undefined,
    }));

  return (
    <>
      <TituloPagina
        titulo="A minha assiduidade"
        descricao="Calculada a partir das tuas entradas na portaria e do horário da turma."
      />
      <AssiduidadeMensal
        mes={mes}
        ano={ano}
        diasLetivos={assiduidade.diasLetivos}
        presencas={assiduidade.presencas}
        atrasos={assiduidade.atrasos}
        faltas={assiduidade.faltas}
        taxaPresenca={assiduidade.taxaPresenca}
        diasAssinalar={diasAssinalar}
      />
    </>
  );
}
