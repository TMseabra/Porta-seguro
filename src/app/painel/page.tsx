import Link from "next/link";
import { exigirSessao } from "@/lib/permissoes";
import { DashboardAluno } from "./dashboard-aluno";
import { atalhosDoPerfil } from "./atalhos";

export default async function Painel({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sessao = await exigirSessao();
  const { erro } = await searchParams;
  const atalhos = atalhosDoPerfil(sessao.user.perfil);

  return (
    <>
      {erro === "sem-permissao" && <p className="aviso aviso-vermelho">Não tens permissão para aceder a essa página.</p>}

      {sessao.user.perfil === "aluno" ? (
        <DashboardAluno alunoId={sessao.user.id} email={sessao.user.email} nome={sessao.user.name ?? "Aluno"} />
      ) : (
        <>
          <div>
            <h1>Olá, {sessao.user.name}</h1>
            <p className="subtitulo">Acede rapidamente às ferramentas da tua área.</p>
          </div>

          {atalhos.length === 0 ? (
            <p className="subtitulo">Ainda não há nada configurado para o teu perfil.</p>
          ) : (
            <div className="grelha">
              {atalhos.map((atalho) => (
                <Link key={atalho.href + atalho.titulo} href={atalho.href} className="cartao cartao-ligacao">
                  <h2>{atalho.titulo}</h2>
                  <p>{atalho.descricao}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
