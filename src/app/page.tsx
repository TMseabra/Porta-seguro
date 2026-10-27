import { redirect } from "next/navigation";

/** Sem sessão o proxy manda para o login; com sessão segue para o painel. */
export default function PaginaInicial() {
  redirect("/painel");
}
