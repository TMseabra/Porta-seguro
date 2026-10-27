import Link from "next/link";
import { auth } from "@/auth";
import { LayoutPublico, CartaoPublico } from "@/components/layout-publico";

const DESTAQUES: [string, string][] = [
  ["QR temporário", "Cada código é válido por um minuto e só pode ser utilizado uma vez."],
  ["Decisões automáticas", "Entradas, saídas e atrasos calculados com base no horário."],
  ["Segurança desde o início", "Contas, sessões e operações protegidas em cada etapa."],
  ["Assiduidade clara", "Presenças, atrasos e faltas num só lugar."],
];

export default async function PaginaInicial() {
  const sessao = await auth();
  const destino = sessao?.user ? "/painel" : "/login";
  const rotulo = sessao?.user ? "Ir para o painel" : "Entrar no sistema";

  return (
    <LayoutPublico ativa="inicio">
      <p className="subtitulo">Projeto UFCD 10790</p>
      <h1 className="titulo-grande mt-2">Entradas e saídas escolares, simples e seguras.</h1>
      <p className="mt-3 max-w-xl">
        Códigos QR temporários, horários inteligentes e registo automático de assiduidade. Tudo num só
        sistema.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={destino} className="botao">
          {rotulo} →
        </Link>
        <Link href="/funcionalidades" className="botao-claro">
          Ver funcionalidades
        </Link>
      </div>
      <p className="subtitulo mt-3">✓ QR de uso único &nbsp; ✓ Horários reais &nbsp; ✓ Assiduidade automática</p>

      <section className="sec">
        <h2>O essencial</h2>
        <div className="grelha">
          {DESTAQUES.map(([titulo, texto]) => (
            <CartaoPublico key={titulo} titulo={titulo}>
              {texto}
            </CartaoPublico>
          ))}
        </div>
      </section>

      <section className="sec">
        <h2>Cada perfil vê só o que precisa</h2>
        <p className="subtitulo">
          Aluno, porteiro, professor, diretor de turma, coordenador, gestor e administrador.{" "}
          <Link href="/seguranca" className="underline">
            Como protegemos os dados
          </Link>
        </p>
      </section>
    </LayoutPublico>
  );
}
