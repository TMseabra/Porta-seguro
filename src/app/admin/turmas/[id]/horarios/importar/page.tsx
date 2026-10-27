import { notFound } from "next/navigation";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Turma } from "@/models";
import { PaginaInterna } from "@/components/pagina-interna";
import { FormularioImportar } from "./formulario-importar";

export default async function PaginaImportarHorario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();
  const { id } = await params;

  const turma = await Turma.findById(id).select("nome").lean();
  if (!turma) notFound();

  return (
    <PaginaInterna
      titulo={`Importar horário — ${turma.nome}`}
      voltarHref={`/admin/turmas/${id}`}
      voltarLabel={turma.nome}>
      <FormularioImportar turmaId={id} turmaNome={turma.nome} />
    </PaginaInterna>
  );
}
