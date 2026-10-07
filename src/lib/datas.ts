/**
 * Datas e horas no fuso de Lisboa. Guardam-se em UTC na BD, mas apresentam-se e comparam-se
 * sempre em Europe/Lisbon: com a hora de verão, comparar UTC com o horário da turma dava uma
 * hora de diferença e atrasos que não existem.
 */

export const FUSO_LISBOA = "Europe/Lisbon";

export const NOMES_DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

const DIAS_EM_INGLES: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface PartesData {
  ano: number;
  mes: number; // 1 a 12
  dia: number; // 1 a 31
  horas: number; // 0 a 23
  minutos: number; // 0 a 59
  segundos: number; // 0 a 59
  diaSemana: number; // 0 = domingo, 1 = segunda, ... 6 = sábado
}

export function partesEmLisboa(data: Date): PartesData {
  const formatador = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_LISBOA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23", // garante 00-23 e nunca "24"
  });

  const partes: Record<string, string> = {};
  for (const parte of formatador.formatToParts(data)) {
    partes[parte.type] = parte.value;
  }

  return {
    ano: Number(partes.year),
    mes: Number(partes.month),
    dia: Number(partes.day),
    horas: Number(partes.hour),
    minutos: Number(partes.minute),
    segundos: Number(partes.second),
    diaSemana: DIAS_EM_INGLES[partes.weekday] ?? 0,
  };
}

export function diaDaSemanaEmLisboa(data: Date): number {
  return partesEmLisboa(data).diaSemana;
}

/** Ex.: 08:30 devolve 510. Permite comparar com os blocos do horário só com inteiros. */
export function minutosDoDiaEmLisboa(data: Date): number {
  const p = partesEmLisboa(data);
  return p.horas * 60 + p.minutos;
}

/** "AAAA-MM-DD" em Lisboa, para agrupar registos por dia. */
export function chaveDoDiaEmLisboa(data: Date): string {
  const p = partesEmLisboa(data);
  const mes = String(p.mes).padStart(2, "0");
  const dia = String(p.dia).padStart(2, "0");
  return `${p.ano}-${mes}-${dia}`;
}

/** Converte "08:30" em minutos desde a meia-noite (os horários guardam-se como texto). */
export function horaParaMinutos(hora: string): number {
  const encaixe = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());

  if (!encaixe) {
    throw new Error(`Hora inválida: "${hora}". Formato esperado: "HH:MM".`);
  }

  const horas = Number(encaixe[1]);
  const minutos = Number(encaixe[2]);

  if (horas > 23 || minutos > 59) {
    throw new Error(`Hora inválida: "${hora}". Tem de estar entre 00:00 e 23:59.`);
  }

  return horas * 60 + minutos;
}

export function minutosParaHora(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}

export function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: FUSO_LISBOA,
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: FUSO_LISBOA,
    dateStyle: "short",
  }).format(data);
}

/**
 * Intervalo [inicio, fim) em UTC do dia de Lisboa em que cai `data`.
 * Date.UTC só percebe UTC: cria-se um candidato à meia-noite e corrige-se pelo desvio que
 * Lisboa tem nesse dia. O fim é a meia-noite SEGUINTE, não inicio + 24h: no dia em que a hora
 * de verão acaba (25h) isso caía dentro do mesmo dia e calcularAssiduidade ficava num ciclo
 * infinito que encravava o servidor.
 */
export function limitesDoDiaEmLisboa(data: Date): { inicio: Date; fim: Date } {
  const { ano, mes, dia } = partesEmLisboa(data);
  return {
    inicio: meiaNoiteEmLisboa(ano, mes, dia),
    // `Date.UTC` aceita dia 32, 33... e passa sozinho para o mês seguinte.
    fim: meiaNoiteEmLisboa(ano, mes, dia + 1),
  };
}

function meiaNoiteEmLisboa(ano: number, mes: number, dia: number): Date {
  const candidato = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0));
  const desvioMinutos = minutosDoDiaEmLisboa(candidato);
  return new Date(candidato.getTime() - desvioMinutos * 60 * 1000);
}

/**
 * Intervalo [inicio, fim) de um mês (mes de 1 a 12), usado nas consultas por mês (RF07).
 * Parte do meio-dia do dia 1, que nunca muda de dia em Lisboa.
 */
export function limitesDoMesEmLisboa(ano: number, mes: number): { inicio: Date; fim: Date } {
  const inicio = limitesDoDiaEmLisboa(new Date(Date.UTC(ano, mes - 1, 1, 12))).inicio;
  const fim = limitesDoDiaEmLisboa(new Date(Date.UTC(ano, mes, 1, 12))).inicio;
  return { inicio, fim };
}

/**
 * Converte uma data/hora "de parede" em Lisboa no instante UTC. Usada nas simulações: um
 * new Date() leria no fuso do servidor (UTC na Vercel). Mesma correção por desvio de
 * limitesDoDiaEmLisboa.
 */
export function horaLisboaParaUtc(
  ano: number,
  mes: number,
  dia: number,
  horas: number,
  minutos: number,
): Date {
  const candidato = new Date(Date.UTC(ano, mes - 1, dia, horas, minutos, 0));
  const p = partesEmLisboa(candidato);
  const candidatoComoUtc = Date.UTC(p.ano, p.mes - 1, p.dia, p.horas, p.minutos);
  const desejadoComoUtc = Date.UTC(ano, mes - 1, dia, horas, minutos);
  return new Date(candidato.getTime() - (candidatoComoUtc - desejadoComoUtc));
}

export function formatarHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: FUSO_LISBOA,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(data);
}
