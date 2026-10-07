/**
 * Preenche a BD com dados de demonstração (2 cursos, 4 turmas, ~20 alunos, horários de uma semana,
 * alguns registos). `npm run seed`. APAGA as 7 coleções primeiro: só para desenvolvimento.
 */

// O Next.js carrega o .env.local sozinho; este script corre fora dele (tsx).
process.loadEnvFile(".env.local");

/**
 * Travão de segurança: o script apaga tudo e o Atlas gratuito não faz backups, por isso recusa-se a
 * correr sem pedido explícito. Protege do engano (ex.: URI de produção colada no .env.local).
 */
const CONFIRMACAO = "--apagar-tudo";

if (!process.argv.includes(CONFIRMACAO)) {
  // Mostra QUAL base de dados vai ser apagada, para se dar pelo engano a tempo.
  const uri = process.env.MONGODB_URI ?? "";
  const nomeBaseDados = uri.split("/").pop()?.split("?")[0] || "(desconhecida)";

  console.error(
    [
      "",
      "  O seed APAGA tudo o que está na base de dados antes de recriar.",
      `  Base de dados que ia ser apagada: ${nomeBaseDados}`,
      "",
      "  Se é mesmo isso que queres, corre:",
      `      npm run seed -- ${CONFIRMACAO}`,
      "",
    ].join("\n"),
  );
  process.exit(1);
}

import crypto from "node:crypto";
import mongoose from "mongoose";
import { Curso, Turma, Horario, Utilizador, Registo, Ocorrencia } from "@/models";
import type { IUtilizador, ICurso, ITurma } from "@/models";
import { hashPassword } from "@/lib/senha";
import type { Perfil } from "@/lib/constantes";

/**
 * Não fica escrita no código: vem de `SEED_PASSWORD`; se faltar, gera-se uma nova a cada execução
 * e imprime-se no fim.
 */
const PALAVRA_PASSE_SEED =
  process.env.SEED_PASSWORD ?? `Seed-${crypto.randomBytes(6).toString("base64url")}`;

const DISCIPLINAS_API = [
  "Programação",
  "Base de Dados",
  "Redes de Computadores",
  "Sistemas Operativos",
  "Inglês Técnico",
];

const DISCIPLINAS_MEC = [
  "Design Gráfico",
  "Edição de Vídeo",
  "Fotografia Digital",
  "Animação 2D",
  "Inglês Técnico",
];

// Cada professor dá sempre a MESMA disciplina, em todas as turmas onde ela existe.
const PROFESSOR_POR_DISCIPLINA: Record<string, string> = {
  "Programação": "Ana Ferreira",
  "Base de Dados": "Bruno Costa",
  "Redes de Computadores": "Carla Santos",
  "Sistemas Operativos": "Diogo Pereira",
  "Inglês Técnico": "Elisa Rocha",
  "Design Gráfico": "Filipe Nogueira",
  "Edição de Vídeo": "Gabriela Alves",
  "Fotografia Digital": "Hugo Teixeira",
  "Animação 2D": "Íris Cunha",
};

const NOMES_ALUNOS = [
  "Beatriz Almeida",
  "Rodrigo Silva",
  "Matilde Sousa",
  "Tomás Oliveira",
  "Leonor Rodrigues",
  "Gonçalo Martins",
  "Carolina Jesus",
  "Afonso Pinto",
  "Mariana Carvalho",
  "Duarte Gomes",
  "Inês Ribeiro",
  "Francisco Marques",
  "Sofia Lopes",
  "Vasco Fernandes",
  "Madalena Teixeira",
  "Guilherme Correia",
  "Benedita Cardoso",
  "Simão Mendes",
  "Lara Nunes",
  "Diogo Antunes",
];

function slug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, ".");
}

interface DefinicaoTurma {
  nome: string;
  ano: number;
  curso: ICurso;
  disciplinas: string[];
}

interface AlunoResumoSeed {
  _id: mongoose.Types.ObjectId;
  email: string;
  numeroCartao?: string;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "A variável de ambiente MONGODB_URI não está definida. " +
        "Confirma que o .env.local existe e está preenchido.",
    );
  }

  await mongoose.connect(uri);
  console.log(`Ligado à base de dados "${mongoose.connection.name}".`);

  console.log("A limpar dados existentes...");
  await Promise.all([
    Utilizador.deleteMany({}),
    Curso.deleteMany({}),
    Turma.deleteMany({}),
    Horario.deleteMany({}),
    Registo.deleteMany({}),
    Ocorrencia.deleteMany({}),
  ]);

  const palavraPasse = await hashPassword(PALAVRA_PASSE_SEED);

  function novoUtilizador(
    nomeCompleto: string,
    email: string,
    perfil: Perfil,
    extra: Partial<IUtilizador> = {},
  ) {
    return { nomeCompleto, email, palavraPasse, perfil, ...extra };
  }

  const admin = await Utilizador.create(
    novoUtilizador("Administrador do Sistema", "admin@portaoseguro.pt", "admin"),
  );
  const porteiro = await Utilizador.create(
    novoUtilizador("Porteiro Principal", "porteiro@portaoseguro.pt", "porteiro"),
  );
  // "gestor": permissões do admin, mas sem acesso ao Portão Teste (ver constantes.ts).
  await Utilizador.create(novoUtilizador("Gestora da Escola", "gestor@portaoseguro.pt", "gestor"));
  // Um coordenador por curso, para testar que cada um só vê as turmas do SEU curso.
  const coordenadorAPI = await Utilizador.create(
    novoUtilizador("Coordenador de Curso (API)", "coordenador@portaoseguro.pt", "coordenador"),
  );
  const coordenadorMEC = await Utilizador.create(
    novoUtilizador("Coordenadora de Curso (MEC)", "coordenador.mec@portaoseguro.pt", "coordenador"),
  );

  const professores = await Utilizador.insertMany(
    Object.values(PROFESSOR_POR_DISCIPLINA).map((nome) =>
      novoUtilizador(nome, `${slug(nome)}@portaoseguro.pt`, "professor"),
    ),
  );
  const idProfessorPorNome = new Map(professores.map((p) => [p.nomeCompleto, p._id]));
  const idProfessorPorDisciplina = new Map(
    Object.entries(PROFESSOR_POR_DISCIPLINA).map(([disciplina, nome]) => [
      disciplina,
      idProfessorPorNome.get(nome)!,
    ]),
  );

  const cursoAPI = await Curso.create({
    nome: "Técnico de Programação",
    sigla: "API",
    anosDuracao: 3,
    coordenadorId: coordenadorAPI._id,
  });
  const cursoMEC = await Curso.create({
    nome: "Técnico de Multimédia",
    sigla: "MEC",
    anosDuracao: 3,
    coordenadorId: coordenadorMEC._id,
  });

  coordenadorAPI.cursosQueCoordena = [cursoAPI._id];
  await coordenadorAPI.save();
  coordenadorMEC.cursosQueCoordena = [cursoMEC._id];
  await coordenadorMEC.save();

  const definicoesTurmas: DefinicaoTurma[] = [
    { nome: "2API", ano: 2, curso: cursoAPI, disciplinas: DISCIPLINAS_API },
    { nome: "3API", ano: 3, curso: cursoAPI, disciplinas: DISCIPLINAS_API },
    { nome: "1MEC", ano: 1, curso: cursoMEC, disciplinas: DISCIPLINAS_MEC },
    { nome: "2MEC", ano: 2, curso: cursoMEC, disciplinas: DISCIPLINAS_MEC },
  ];

  // Dia normal: manhã + bloco a seguir ao almoço; terça e quinta alargam-se até às 16h/18h para testar
  // saídas à hora de almoço num dia mais comprido.
  const BLOCO_MANHA: Array<[string, string]> = [
    ["08:30", "10:00"],
    ["10:15", "11:45"],
  ];
  const BLOCO_TARDE_CURTA: Array<[string, string]> = [["13:00", "14:30"]];
  const BLOCO_TARDE_ATE_16H: Array<[string, string]> = [
    ["13:00", "14:30"],
    ["14:45", "16:15"],
  ];
  const BLOCO_TARDE_ATE_18H: Array<[string, string]> = [
    ["13:00", "14:30"],
    ["14:45", "16:15"],
    ["16:30", "18:00"],
  ];

  const BLOCOS_POR_DIA: Record<number, Array<[string, string]>> = {
    1: [...BLOCO_MANHA, ...BLOCO_TARDE_CURTA], // segunda — dia normal
    2: [...BLOCO_MANHA, ...BLOCO_TARDE_ATE_16H], // terça — sai às 16h
    3: [...BLOCO_MANHA, ...BLOCO_TARDE_CURTA], // quarta — dia normal
    4: [...BLOCO_MANHA, ...BLOCO_TARDE_ATE_18H], // quinta — sai às 18h
    5: [...BLOCO_MANHA, ...BLOCO_TARDE_CURTA], // sexta — dia normal
  };

  const turmasCriadas: ITurma[] = [];
  const alunosPorTurma: AlunoResumoSeed[][] = [];
  let contadorAluno = 0;

  for (const def of definicoesTurmas) {
    const dt = await Utilizador.create(
      novoUtilizador(
        `Diretor(a) de Turma ${def.nome}`,
        `dt.${def.nome.toLowerCase()}@portaoseguro.pt`,
        "dt",
      ),
    );

    const turma = await Turma.create({
      nome: def.nome,
      ano: def.ano,
      cursoId: def.curso._id,
      diretorTurmaId: dt._id,
    });
    turmasCriadas.push(turma);

    dt.turmasQueCoordena = [turma._id];
    await dt.save();

    const horariosDaTurma = [];
    for (let diaSemana = 1; diaSemana <= 5; diaSemana++) {
      for (const [indice, [horaInicio, horaFim]] of BLOCOS_POR_DIA[diaSemana].entries()) {
        const disciplina = def.disciplinas[(diaSemana + indice) % def.disciplinas.length];
        horariosDaTurma.push({
          turmaId: turma._id,
          diaSemana,
          horaInicio,
          horaFim,
          disciplina,
          professorId: idProfessorPorDisciplina.get(disciplina),
          sala: `Sala ${101 + indice}`,
        });
      }
    }
    await Horario.insertMany(horariosDaTurma);

    const alunosDaTurma: AlunoResumoSeed[] = [];
    for (let i = 0; i < 5; i++) {
      const nome = NOMES_ALUNOS[contadorAluno] ?? `Aluno ${contadorAluno + 1}`;
      const numeroAluno = 20001 + contadorAluno;
      // Ano 3: todos maiores de idade, para demonstrar saídas fora do horário.
      const maiorIdade = def.ano >= 3 || Math.random() < 0.25;
      const aluno = await Utilizador.create(
        novoUtilizador(nome, `aluno${numeroAluno}@portaoseguro.pt`, "aluno", {
          numeroAluno,
          numeroCartao: String(numeroAluno),
          turmaId: turma._id,
          maiorIdade,
          autorizacaoPais: !maiorIdade && Math.random() < 0.5,
          // Um suspenso por turma, para demonstrar o bloqueio de entrada (RF03).
          suspenso: i === 4,
        }),
      );
      alunosDaTurma.push({ _id: aluno._id, email: aluno.email, numeroCartao: aluno.numeroCartao });
      contadorAluno++;
    }
    alunosPorTurma.push(alunosDaTurma);
  }

  const todosAlunos = alunosPorTurma.flat();

  // Registos de ontem para a tabela de consultas não ficar vazia. Presenças/faltas nunca se inserem à mão.
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  function horaOntem(horas: number, minutos: number): Date {
    const data = new Date(ontem);
    data.setHours(horas, minutos, 0, 0);
    return data;
  }

  const registosExemplo = [];
  for (const aluno of todosAlunos.slice(0, 8)) {
    registosExemplo.push({
      alunoId: aluno._id,
      dataHora: horaOntem(8, 32),
      tipo: "entrada",
      metodo: "cartao",
      estado: "autorizado",
      motivo: "Entrada dentro de horário.",
      registadoPorId: porteiro._id,
    });
    registosExemplo.push({
      alunoId: aluno._id,
      dataHora: horaOntem(17, 5),
      tipo: "saida",
      metodo: "cartao",
      estado: "autorizado",
      motivo: "Fora do horário letivo.",
      registadoPorId: porteiro._id,
    });
  }

  const [alunoNegado, alunoConfirmadoPais] = todosAlunos.slice(8, 10);
  registosExemplo.push({
    alunoId: alunoNegado._id,
    dataHora: horaOntem(11, 0),
    tipo: "saida",
    metodo: "cartao",
    estado: "nao_autorizado",
    motivo: "Dentro do horário letivo e sem autorização dos pais para sair.",
    registadoPorId: porteiro._id,
  });
  registosExemplo.push({
    alunoId: alunoConfirmadoPais._id,
    dataHora: horaOntem(11, 15),
    tipo: "saida",
    metodo: "cartao",
    estado: "confirmado_pais",
    motivo: "Saída fora do horário confirmada por telefone com os pais.",
    registadoPorId: porteiro._id,
    confirmacaoPais: true,
  });

  await Registo.insertMany(registosExemplo);

  const alunoSuspenso = alunosPorTurma[0][4];
  const registoBloqueado = await Registo.create({
    alunoId: alunoSuspenso._id,
    dataHora: horaOntem(8, 40),
    tipo: "entrada",
    metodo: "cartao",
    estado: "nao_autorizado",
    motivo: "Aluno suspenso.",
    registadoPorId: porteiro._id,
  });
  await Ocorrencia.create({
    alunoId: alunoSuspenso._id,
    tipo: "entrada_suspenso",
    descricao: "Tentativa de entrada de aluno suspenso.",
    dataHora: horaOntem(8, 40),
    registoId: registoBloqueado._id,
  });

  console.log("\nSemeado com sucesso:");
  console.log(`  Cursos: 2, Turmas: ${turmasCriadas.length}, Alunos: ${todosAlunos.length}`);
  const blocosPorTurma = Object.values(BLOCOS_POR_DIA).reduce(
    (total, blocosDoDia) => total + blocosDoDia.length,
    0,
  );
  console.log(
    `  Professores: ${professores.length}, Horários: ${turmasCriadas.length * blocosPorTurma}`,
  );
  console.log(`  Registos: ${registosExemplo.length + 1}, Ocorrências: 1`);
  console.log("\nContas para experimentar (todas com a mesma palavra-passe):");
  console.log(`  Palavra-passe: ${PALAVRA_PASSE_SEED}`);
  console.log(`  Admin:       ${admin.email}`);
  console.log(`  Gestor:      gestor@portaoseguro.pt`);
  console.log(`  Porteiro:    ${porteiro.email}`);
  console.log(`  Coordenador (API): ${coordenadorAPI.email}`);
  console.log(`  Coordenador (MEC): ${coordenadorMEC.email}`);
  console.log(`  Aluno (ex.): ${todosAlunos[0].email} (cartão ${todosAlunos[0].numeroCartao})`);

  await mongoose.disconnect();
}

main().catch((erro) => {
  console.error("Falhou:", erro);
  process.exit(1);
});
