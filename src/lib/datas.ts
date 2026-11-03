/** Guarda-se em UTC; compara-se e apresenta-se em Europe/Lisbon (a hora de verão dava atrasos falsos). */

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
  mes: number;
  dia: number;
  horas: number;
  minutos: number;
  segundos: number;
  diaSemana: number;
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
    hourCycle: "h23",
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

export function minutosDoDiaEmLisboa(data: Date): number {
  const p = partesEmLisboa(data);
  return p.horas * 60 + p.minutos;
}

export function chaveDoDiaEmLisboa(data: Date): string {
  const p = partesEmLisboa(data);
  const mes = String(p.mes).padStart(2, "0");
  const dia = String(p.dia).padStart(2, "0");
  return `${p.ano}-${mes}-${dia}`;
}

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

/** [inicio, fim) em UTC do dia de Lisboa. O fim é a meia-noite seguinte, não +24h (dia de 25h). */
export function limitesDoDiaEmLisboa(data: Date): { inicio: Date; fim: Date } {
  const { ano, mes, dia } = partesEmLisboa(data);
  return {
    inicio: meiaNoiteEmLisboa(ano, mes, dia),
    fim: meiaNoiteEmLisboa(ano, mes, dia + 1),
  };
}

function meiaNoiteEmLisboa(ano: number, mes: number, dia: number): Date {
  const candidato = new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0));
  const desvioMinutos = minutosDoDiaEmLisboa(candidato);
  return new Date(candidato.getTime() - desvioMinutos * 60 * 1000);
}

export function limitesDoMesEmLisboa(ano: number, mes: number): { inicio: Date; fim: Date } {
  const inicio = limitesDoDiaEmLisboa(new Date(Date.UTC(ano, mes - 1, 1, 12))).inicio;
  const fim = limitesDoDiaEmLisboa(new Date(Date.UTC(ano, mes, 1, 12))).inicio;
  return { inicio, fim };
}

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
