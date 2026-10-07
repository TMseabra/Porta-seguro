/**
 * Interpreta as linhas de um Excel de horário (RF10). Função pura: recebe as linhas lidas pelo `xlsx`
 * e a lista de professores, e devolve cada linha com o que percebeu e os erros, para pré-visualizar
 * antes de gravar. Formato (cabeçalhos na 1.ª linha, ordem livre): Dia | Início | Fim | Disciplina |
 * Professor | Sala. "Dia" aceita o nome ou 0-6 (0 = domingo); "Professor" tem de ser o nome completo
 * de uma conta professor/dt.
 */

export interface ProfessorDisponivel {
  id: string;
  nome: string;
}

export interface LinhaImportada {
  /** Número da linha no Excel (a 1.ª de dados é a 2), para localizar o erro na folha. */
  numeroLinha: number;
  diaSemana?: number;
  horaInicio?: string;
  horaFim?: string;
  disciplina?: string;
  professorNome?: string;
  professorId?: string;
  sala?: string;
  erros: string[];
}

const NOMES_DIAS: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  "segunda-feira": 1,
  terca: 2,
  "terca-feira": 2,
  quarta: 3,
  "quarta-feira": 3,
  quinta: 4,
  "quinta-feira": 4,
  sexta: 5,
  "sexta-feira": 5,
  sabado: 6,
};

/** Tira acentos e maiúsculas: "Terça", "terca" e "TERÇA-FEIRA" contam todos. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export function diaSemanaDeTexto(valor: string): number | undefined {
  const normalizado = normalizar(valor);
  if (normalizado in NOMES_DIAS) return NOMES_DIAS[normalizado];

  const numero = Number(normalizado);
  if (Number.isInteger(numero) && numero >= 0 && numero <= 6) return numero;

  return undefined;
}

const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Aceita "08:30" ou o decimal que o Excel usa por vezes para horas (0.3541... = 08:30). */
function normalizarHora(valor: unknown): string | undefined {
  if (typeof valor === "string") {
    const texto = valor.trim();
    return REGEX_HORA.test(texto) ? texto : undefined;
  }
  if (typeof valor === "number" && valor >= 0 && valor < 1) {
    const minutosTotais = Math.round(valor * 24 * 60);
    const horas = Math.floor(minutosTotais / 60);
    const minutos = minutosTotais % 60;
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  }
  return undefined;
}

function textoDaCelula(valor: unknown): string {
  if (valor === undefined || valor === null) return "";
  return String(valor).trim();
}

/** Cada linha vem como objeto (cabeçalho -> célula), o formato de XLSX.utils.sheet_to_json. */
export function interpretarLinhasExcel(
  linhas: Array<Record<string, unknown>>,
  professoresDisponiveis: ProfessorDisponivel[],
): LinhaImportada[] {
  const professorPorNomeNormalizado = new Map(
    professoresDisponiveis.map((p) => [normalizar(p.nome), p]),
  );

  return linhas.map((linha, indice) => {
    // Aceita os cabeçalhos com ou sem acento e maiúsculas.
    const porChaveNormalizada = new Map(
      Object.entries(linha).map(([chave, valor]) => [normalizar(chave), valor]),
    );
    function coluna(...nomes: string[]): unknown {
      for (const nome of nomes) {
        const valor = porChaveNormalizada.get(nome);
        if (valor !== undefined) return valor;
      }
      return undefined;
    }

    const erros: string[] = [];

    const textoDia = textoDaCelula(coluna("dia", "dia da semana"));
    const diaSemana = textoDia ? diaSemanaDeTexto(textoDia) : undefined;
    if (!textoDia) erros.push('Falta o "Dia".');
    else if (diaSemana === undefined) erros.push(`Dia "${textoDia}" não reconhecido.`);

    const horaInicio = normalizarHora(coluna("inicio", "início", "hora inicio", "hora de inicio"));
    if (!horaInicio) erros.push('"Início" tem de estar no formato HH:MM.');

    const horaFim = normalizarHora(coluna("fim", "hora fim", "hora de fim"));
    if (!horaFim) erros.push('"Fim" tem de estar no formato HH:MM.');

    if (horaInicio && horaFim && horaFim <= horaInicio) {
      erros.push('"Fim" tem de ser depois de "Início".');
    }

    const disciplina = textoDaCelula(coluna("disciplina"));
    if (!disciplina) erros.push('Falta a "Disciplina".');

    const professorNome = textoDaCelula(coluna("professor"));
    const professor = professorNome ? professorPorNomeNormalizado.get(normalizar(professorNome)) : undefined;
    if (professorNome && !professor) {
      erros.push(`Professor "${professorNome}" não encontrado (o nome tem de ser igual ao da conta).`);
    }

    const sala = textoDaCelula(coluna("sala")) || undefined;

    return {
      numeroLinha: indice + 2,
      diaSemana,
      horaInicio,
      horaFim,
      disciplina: disciplina || undefined,
      professorNome: professorNome || undefined,
      professorId: professor?.id,
      sala,
      erros,
    };
  });
}
