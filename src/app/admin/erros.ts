export function mensagemDeErroMongoose(erro: unknown, mensagemDuplicado: string): string {
  if (erro && typeof erro === "object" && "code" in erro && (erro as { code?: number }).code === 11000) {
    return mensagemDuplicado;
  }

  // Só mostra mensagens nossas: um erro do servidor da BD pode revelar coleções, índices ou o cluster.
  if (erro instanceof Error && (erro.name === "ValidationError" || erro.name === "Error")) {
    return erro.message;
  }

  return "Ocorreu um erro inesperado.";
}
