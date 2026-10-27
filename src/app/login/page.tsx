import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { redirect } from "next/navigation";
import { FormularioCredenciais } from "./formulario-credenciais";
import { entrarComGoogle } from "./acoes";
import { BarraTopo } from "@/components/barra-topo";

/**
 * Mensagens para os `?error=` do Auth.js (ex.: conta Google sem `Utilizador` na escola); sem elas a
 * recusa não mostrava nada.
 */
const MENSAGENS_ERRO_LOGIN: Record<string, string> = {
  AccessDenied:
    "Esta conta Google não tem acesso ao PortãoSeguro. Só entra quem já tiver uma conta criada na escola — fala com a administração.",
  Configuration: "Erro de configuração do login. Tenta novamente mais tarde.",
};

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // O proxy já redireciona; repete-se por segurança.
  const sessao = await auth();
  if (sessao?.user) {
    redirect("/painel");
  }

  const { error } = await searchParams;
  const mensagemErro = error
    ? (MENSAGENS_ERRO_LOGIN[error] ?? "Não foi possível iniciar sessão. Tenta novamente.")
    : null;

  return (
    <div className="flex min-h-full flex-col">
      <BarraTopo titulo="PortãoSeguro" voltar={{ href: "/", texto: "← Página principal" }} />

      <main className="pagina-login">
        <div className="cartao cartao-login">
          <div className="mb-4 flex flex-col items-center gap-1 text-center">
            <Logo className="h-11 w-11" decorativa />
            <h1 className="text-xl font-bold">PortãoSeguro</h1>
            <p className="subtitulo">Inicia sessão para continuar</p>
          </div>

          {mensagemErro && <p className="aviso aviso-vermelho mb-3">{mensagemErro}</p>}

          <FormularioCredenciais />

          <p className="subtitulo my-3 text-center">ou</p>

          <form action={entrarComGoogle}>
            <button type="submit" className="botao-claro flex w-full items-center justify-center gap-2">
              <LogoGoogle />
              Entrar com conta Google
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function LogoGoogle() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
