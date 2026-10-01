import { exigirPerfil } from "@/lib/permissoes";
import { GeradorQR } from "@/app/area-pessoal/gerador-qr";
import { TituloPagina, Cartao } from "../shell";
import { tokenInicialDoAluno, permissoesQR } from "../dados-aluno";

export default async function PaginaQR() {
  const sessao = await exigirPerfil(["aluno"]);
  const [tokenInicial, { podeGerar, podeEscolherHora }] = await Promise.all([
    tokenInicialDoAluno(sessao.user.id),
    permissoesQR(sessao.user.email),
  ]);

  return (
    <>
      <TituloPagina
        titulo="Código QR"
        descricao="Mostra este código na portaria para entrar ou sair da escola."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Cartao className="flex flex-col items-center py-8">
          <GeradorQR tokenInicial={tokenInicial} podeGerar={podeGerar} podeEscolherHora={podeEscolherHora} />
        </Cartao>
        <Cartao>
          <h2 className="mb-4 font-semibold">Como funciona</h2>
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li><strong>1.</strong> Carrega em &quot;Gerar código QR&quot; — no telemóvel.</li>
            <li><strong>2.</strong> Mostra o código ao porteiro, que o lê com a câmara.</li>
            <li><strong>3.</strong> O porteiro confirma que és tu pela fotografia, e o sistema regista a entrada ou saída.</li>
          </ol>
          <ul className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">
            <li>• Cada código só é válido durante <strong>1 minuto</strong>.</li>
            <li>• Só pode ser usado <strong>uma vez</strong>.</li>
            <li>• Só serve para o movimento indicado (entrada <em>ou</em> saída).</li>
            <li>• Gerar um novo código anula o anterior.</li>
          </ul>
        </Cartao>
      </div>
    </>
  );
}
