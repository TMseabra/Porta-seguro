import Link from "next/link";
import { exigirSessao } from "@/lib/permissoes";
import { GeradorQR } from "./qr/gerador-qr";
import { atalhosDoPerfil } from "./atalhos";
import { tokenInicialDoAluno, permissoesQR } from "./dados-aluno";

export default async function Painel({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sessao = await exigirSessao();
  const { erro } = await searchParams;

  const aviso = erro === "sem-permissao" && (
    <p className="aviso aviso-vermelho">Não tens permissão para aceder a essa página.</p>
  );

  if (sessao.user.perfil === "aluno") {
    const [tokenInicial, { podeGerar, podeEscolherHora }] = await Promise.all([
      tokenInicialDoAluno(sessao.user.id),
      permissoesQR(sessao.user.email),
    ]);

    return (
      <>
        {aviso}
        <div>
          <h1>Código QR</h1>
          <p className="subtitulo">Mostra este código na portaria para entrar ou sair da escola.</p>
        </div>
        <section className="cartao">
          <GeradorQR tokenInicial={tokenInicial} podeGerar={podeGerar} podeEscolherHora={podeEscolherHora} />
        </section>
        <ul className="lista subtitulo">
          <li>Cada código só é válido durante 1 minuto e só pode ser usado uma vez.</li>
          <li>Só serve para o movimento indicado (entrada ou saída).</li>
          <li>Gerar um novo código anula o anterior.</li>
        </ul>
      </>
    );
  }

  const atalhos = atalhosDoPerfil(sessao.user.perfil);

  return (
    <>
      {aviso}
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
  );
}
