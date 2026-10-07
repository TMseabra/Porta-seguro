import { describe, expect, it } from "vitest";
import { tipoEsperadoNaLeitura, tipoForcadoNoMovimento } from "./tipoDoCodigo";

describe("tipoEsperadoNaLeitura", () => {
  it("sem escolha, segue a alternância com o último registo", () => {
    expect(tipoEsperadoNaLeitura({ tipo: "entrada" }, "simulacao", undefined)).toBe("entrada");
    expect(tipoEsperadoNaLeitura({ tipo: "saida" }, "simulacao", "entrada")).toBe("saida");
    expect(tipoEsperadoNaLeitura({ tipo: "entrada" }, "qr", "entrada")).toBe("saida");
  });

  it("numa simulação com escolha, a direção escolhida manda — mesmo contra a alternância", () => {
    expect(tipoEsperadoNaLeitura({ tipo: "saida", tipoEscolhido: true }, "simulacao", undefined)).toBe("saida");
    expect(tipoEsperadoNaLeitura({ tipo: "entrada", tipoEscolhido: true }, "simulacao", "entrada")).toBe("entrada");
  });

  it("num movimento REAL a escolha é ignorada, mesmo que o código a traga marcada", () => {
    expect(tipoEsperadoNaLeitura({ tipo: "saida", tipoEscolhido: true }, "qr", undefined)).toBe("entrada");
    expect(tipoEsperadoNaLeitura({ tipo: "saida", tipoEscolhido: true }, "cartao", undefined)).toBe("entrada");
  });

  it("tipoEscolhido falso não força nada", () => {
    expect(tipoEsperadoNaLeitura({ tipo: "saida", tipoEscolhido: false }, "simulacao", undefined)).toBe("entrada");
  });
});

describe("tipoForcadoNoMovimento", () => {
  it("só força a direção numa simulação com escolha", () => {
    expect(tipoForcadoNoMovimento({ tipo: "saida", tipoEscolhido: true }, "simulacao")).toBe("saida");
    expect(tipoForcadoNoMovimento({ tipo: "entrada", tipoEscolhido: true }, "simulacao")).toBe("entrada");
  });

  it("não força nada sem escolha", () => {
    expect(tipoForcadoNoMovimento({ tipo: "saida" }, "simulacao")).toBeUndefined();
    expect(tipoForcadoNoMovimento({ tipo: "saida", tipoEscolhido: false }, "simulacao")).toBeUndefined();
  });

  it("nunca força num movimento real", () => {
    expect(tipoForcadoNoMovimento({ tipo: "saida", tipoEscolhido: true }, "qr")).toBeUndefined();
    expect(tipoForcadoNoMovimento({ tipo: "saida", tipoEscolhido: true }, "cartao")).toBeUndefined();
  });
});
