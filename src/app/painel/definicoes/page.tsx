import { exigirPerfil } from "@/lib/permissoes";
import { ligarBaseDados } from "@/lib/mongoose";
import { signOut } from "@/auth";
import { Utilizador, Turma } from "@/models";
import { ThemeToggle } from "@/app/theme-provider";
import { TituloPagina, Cartao, ROTULO_PERFIL } from "../shell";

export default async function PaginaDefinicoes() {
  const sessao = await exigirPerfil(["aluno"]);
  await ligarBaseDados();

  const aluno = await Utilizador.findById(sessao.user.id)
    .select("nomeCompleto email numeroAluno numeroCartao turmaId maiorIdade autorizacaoPais")
    .lean();
  const turma = aluno?.turmaId ? await Turma.findById(aluno.turmaId).select("nome").lean() : null;

  const dados: [string, string][] = [
    ["Nome", aluno?.nomeCompleto ?? sessao.user.name ?? "—"],
    ["Email", aluno?.email ?? sessao.user.email ?? "—"],
    ["Perfil", ROTULO_PERFIL[sessao.user.perfil]],
    ["Turma", turma?.nome ?? "Sem turma atribuída"],
    ["N.º de aluno", aluno?.numeroAluno ? String(aluno.numeroAluno) : "—"],
    ["Cartão", aluno?.numeroCartao ?? "—"],
    ["Maior de idade", aluno?.maiorIdade ? "Sim" : "Não"],
    ["Saída autorizada pelos pais", aluno?.autorizacaoPais ? "Sim" : "Não"],
  ];

  return (
    <>
      <TituloPagina titulo="Definições" descricao="Os teus dados e preferências." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Cartao>
          <h2 className="mb-4 font-semibold">A minha conta</h2>
          <dl className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
            {dados.map(([rotulo, valor]) => (
              <div key={rotulo} className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-slate-500">{rotulo}</dt>
                <dd className="font-medium">{valor}</dd>
              </div>
            ))}
          </dl>
          {/* Não há alteração de dados self-service: são dados oficiais da
              escola, só a secretaria/administração os pode mudar. */}
          <p className="mt-4 text-xs text-slate-500">
            Algum dado errado, ou precisas de mudar a palavra-passe? Fala com a secretaria da escola.
          </p>
        </Cartao>

        <div className="flex flex-col gap-6">
          <Cartao>
            <h2 className="mb-1 font-semibold">Aparência</h2>
            <p className="mb-4 text-sm text-slate-500">Alterna entre o modo claro e o escuro.</p>
            <ThemeToggle />
          </Cartao>

          <Cartao>
            <h2 className="mb-1 font-semibold">Sessão</h2>
            <p className="mb-4 text-sm text-slate-500">Termina a sessão neste dispositivo.</p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:scale-105 hover:border-red-600 hover:bg-red-600 hover:text-white dark:border-slate-700"
              >
                Terminar sessão
              </button>
            </form>
          </Cartao>
        </div>
      </div>
    </>
  );
}
