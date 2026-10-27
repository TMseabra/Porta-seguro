import { describe, expect, it } from "vitest";
import { limiteDeCodigosQR } from "./limiteQR";

const agora = new Date("2026-01-05T10:00:00.000Z");
const haSegundos = (s: number) => new Date(agora.getTime() - s * 1000);

describe("limiteDeCodigosQR", () => {
  it("sem códigos recentes, pode gerar", () => {
    expect(limiteDeCodigosQR([], agora)).toEqual({ permitido: true });
  });

  it("com 2 códigos no último minuto, ainda pode gerar o 3.º", () => {
    expect(limiteDeCodigosQR([haSegundos(5), haSegundos(30)], agora)).toEqual({ permitido: true });
  });

  it("com 3 códigos no último minuto, não pode, e espera até o mais antigo sair da janela", () => {
    const resultado = limiteDeCodigosQR([haSegundos(5), haSegundos(30), haSegundos(50)], agora);
    expect(resultado).toEqual({ permitido: false, esperarSegundos: 10 });
  });

  it("um código criado há exatamente 60 segundos já não conta (fronteira)", () => {
    expect(limiteDeCodigosQR([haSegundos(60), haSegundos(30), haSegundos(5)], agora)).toEqual({ permitido: true });
  });

  it("um código criado há 59 segundos ainda conta", () => {
    const resultado = limiteDeCodigosQR([haSegundos(59), haSegundos(30), haSegundos(5)], agora);
    expect(resultado).toEqual({ permitido: false, esperarSegundos: 1 });
  });

  it("códigos antigos (de há horas) são ignorados", () => {
    const antigos = [haSegundos(3600), haSegundos(7200), haSegundos(9000)];
    expect(limiteDeCodigosQR(antigos, agora)).toEqual({ permitido: true });
  });

  it("com mais de 3 na janela, espera pelo que liberta uma vaga (não pelo mais antigo de todos)", () => {
    const resultado = limiteDeCodigosQR([haSegundos(55), haSegundos(40), haSegundos(20), haSegundos(5)], agora);
    expect(resultado).toEqual({ permitido: false, esperarSegundos: 20 });
  });
});
