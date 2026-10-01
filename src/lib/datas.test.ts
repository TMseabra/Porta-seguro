import { describe, expect, it } from "vitest";
import {
  limitesDoDiaEmLisboa,
  diaDaSemanaEmLisboa,
  limitesDoMesEmLisboa,
  horaLisboaParaUtc,
} from "./datas";

describe("limitesDoDiaEmLisboa", () => {
  it("em janeiro (UTC+0), meia-noite de Lisboa coincide com meia-noite UTC", () => {
    const { inicio, fim } = limitesDoDiaEmLisboa(new Date("2026-01-05T10:00:00.000Z"));
    expect(inicio.toISOString()).toBe("2026-01-05T00:00:00.000Z");
    expect(fim.toISOString()).toBe("2026-01-06T00:00:00.000Z");
  });

  it("em julho (UTC+1, hora de verão), meia-noite de Lisboa é às 23:00 UTC do dia anterior", () => {
    const { inicio, fim } = limitesDoDiaEmLisboa(new Date("2026-07-15T10:00:00.000Z"));
    expect(inicio.toISOString()).toBe("2026-07-14T23:00:00.000Z");
    expect(fim.toISOString()).toBe("2026-07-15T23:00:00.000Z");
  });

  it("um momento perto da meia-noite continua a cair dentro do intervalo do seu próprio dia", () => {
    const momento = new Date("2026-01-05T23:59:00.000Z"); // 23:59 em Lisboa (janeiro = UTC+0)
    const { inicio, fim } = limitesDoDiaEmLisboa(momento);
    expect(momento.getTime()).toBeGreaterThanOrEqual(inicio.getTime());
    expect(momento.getTime()).toBeLessThan(fim.getTime());
    expect(diaDaSemanaEmLisboa(inicio)).toBe(diaDaSemanaEmLisboa(momento));
  });

  // Regressão: o fim do dia era `inicio + 24h`. No dia em que a hora de
  // verão acaba (25 horas), isso ainda caía dentro do próprio dia, e
  // `calcularAssiduidade` entrava num ciclo infinito que encravava o
  // servidor — aconteceu a sério no 1.º dia de outubro de 2026.
  it("no fim da hora de verão (25 de outubro de 2026), o dia tem 25 horas e o fim é a meia-noite seguinte", () => {
    const { inicio, fim } = limitesDoDiaEmLisboa(new Date("2026-10-25T12:00:00.000Z"));
    expect(inicio.toISOString()).toBe("2026-10-24T23:00:00.000Z");
    expect(fim.toISOString()).toBe("2026-10-26T00:00:00.000Z");
    expect(limitesDoDiaEmLisboa(fim).inicio.getTime()).toBe(fim.getTime());
  });

  it("no início da hora de verão (28 de março de 2027), o dia tem 23 horas e não invade o dia seguinte", () => {
    const { inicio, fim } = limitesDoDiaEmLisboa(new Date("2027-03-28T12:00:00.000Z"));
    expect(inicio.toISOString()).toBe("2027-03-28T00:00:00.000Z");
    expect(fim.toISOString()).toBe("2027-03-28T23:00:00.000Z");
    expect(limitesDoDiaEmLisboa(fim).inicio.getTime()).toBe(fim.getTime());
  });

  it("percorrer um mês dia a dia termina sempre, mesmo com mudança de hora", () => {
    for (const [ano, mes, diasEsperados] of [[2026, 10, 31], [2027, 3, 31], [2026, 9, 30]] as const) {
      const periodo = limitesDoMesEmLisboa(ano, mes);
      let cursor = periodo.inicio;
      let dias = 0;
      while (cursor < periodo.fim && dias < 40) {
        cursor = limitesDoDiaEmLisboa(cursor).fim;
        dias++;
      }
      expect(dias).toBe(diasEsperados);
    }
  });
});

describe("limitesDoMesEmLisboa", () => {
  it("janeiro (UTC+0): vai da meia-noite do dia 1 à meia-noite de 1 de fevereiro", () => {
    const { inicio, fim } = limitesDoMesEmLisboa(2026, 1);
    expect(inicio.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(fim.toISOString()).toBe("2026-02-01T00:00:00.000Z");
  });

  it("julho (UTC+1): a fronteira cai às 23:00 UTC do último dia de junho", () => {
    const { inicio, fim } = limitesDoMesEmLisboa(2026, 7);
    expect(inicio.toISOString()).toBe("2026-06-30T23:00:00.000Z");
    expect(fim.toISOString()).toBe("2026-07-31T23:00:00.000Z");
  });

  it("dezembro: o fim é o início de janeiro do ano seguinte", () => {
    const { fim } = limitesDoMesEmLisboa(2026, 12);
    expect(fim.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});

describe("horaLisboaParaUtc", () => {
  it("em janeiro (UTC+0), a hora de Lisboa coincide com a hora UTC", () => {
    const data = horaLisboaParaUtc(2026, 1, 5, 8, 30);
    expect(data.toISOString()).toBe("2026-01-05T08:30:00.000Z");
  });

  it("em julho (UTC+1, hora de verão), a hora de Lisboa fica uma hora à frente de UTC", () => {
    const data = horaLisboaParaUtc(2026, 7, 15, 8, 30);
    expect(data.toISOString()).toBe("2026-07-15T07:30:00.000Z");
  });

  it("perto da meia-noite, com deslocamento de fuso, o dia civil UTC muda mas continua a mostrar a hora pedida em Lisboa", () => {
    // 00:15 de Lisboa em julho (UTC+1) cai ainda no dia 14 em UTC (23:15).
    const data = horaLisboaParaUtc(2026, 7, 15, 0, 15);
    expect(data.toISOString()).toBe("2026-07-14T23:15:00.000Z");
    expect(diaDaSemanaEmLisboa(data)).toBe(3); // 15 de julho de 2026 é quarta-feira
  });

  it("é o inverso de partesEmLisboa: reconstruir a partir das partes devolve o mesmo instante", () => {
    // 10 de março de 2026 ainda é hora de inverno em Lisboa (a mudança só
    // acontece no último domingo de março), por isso UTC+0 aqui.
    const original = new Date("2026-03-10T14:45:00.000Z");
    const reconstruida = horaLisboaParaUtc(2026, 3, 10, 14, 45);
    expect(reconstruida.getTime()).toBe(original.getTime());
  });
});
