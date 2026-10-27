import Link from "next/link";
import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { Curso, Turma, Utilizador } from "@/models";
import { PaginaInterna } from "@/components/pagina-interna";

export default async function PaginaAdmin() {
  await exigirPerfil(["gestor", "admin"]);
  await ligarBaseDados();

  const [totalCursos, totalTurmas, totalAlunos] = await Promise.all([
    Curso.countDocuments(),
    Turma.countDocuments(),
    Utilizador.countDocuments({ perfil: "aluno" }),
  ]);

  return (
    <PaginaInterna titulo="Administração" voltarHref="/painel" voltarLabel="Painel">
    <div className="grelha">
      <Link href="/admin/cursos" className="cartao cartao-ligacao">
        <h2>Cursos ({totalCursos})</h2>
        <p>Criar, editar e remover cursos.</p>
      </Link>
      <Link href="/admin/turmas" className="cartao cartao-ligacao">
        <h2>Turmas ({totalTurmas})</h2>
        <p>Turmas e os seus horários, incluindo a importação por Excel.</p>
      </Link>
      <Link href="/admin/alunos" className="cartao cartao-ligacao">
        <h2>Alunos ({totalAlunos})</h2>
        <p>Criar, editar e remover alunos.</p>
      </Link>
      <Link href="/horarios?vista=turma" className="cartao cartao-ligacao">
        <h2>Horários</h2>
        <p>Ver o horário de qualquer turma ou professor.</p>
      </Link>
      <Link href="/admin/simulacao" className="cartao cartao-ligacao">
        <h2>Simulação</h2>
        <p>Demonstrar entradas e saídas noutro dia ou hora.</p>
      </Link>
    </div>
  </PaginaInterna>
  );
}
