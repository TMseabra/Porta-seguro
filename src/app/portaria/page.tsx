import { redirect } from "next/navigation";

/** Redirecionamento do endereço antigo (/portaria) para não partir favoritos e links. */
export default function PaginaPortariaAntiga() {
  redirect("/portao-teste");
}
