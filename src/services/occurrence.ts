import { prisma } from "../database/prismaClient.js";

interface CreateOccurrenceDTO {
  type: string;
  gravity: string;
  description: string;
  measuresTaken?: string; //* Adicionado conforme RF05
  students_Id: number;
  users_Id: number; //* RN02: Vinculado automaticamente via Controller
}

interface ListOccurrencesFilters {
  status?: string;
  search?: string;
}

export class OccurrenceService {
  //* RF05 — Criar Registro de Ocorrência
  async create(data: CreateOccurrenceDTO) {
    //* RN01: Validar se o estudante existe
    const studentExists = await prisma.student.findUnique({
      where: { id: data.students_Id },
    });

    if (!studentExists) {
      throw new Error("Estudante não encontrado.");
    }

    //* Correção da validação de Gravidade Máxima (Uso consistente de maiúsculas/minúsculas)
    const isGrave = data.gravity.trim().toUpperCase() === "GRAVE";

    //* Persistência no Banco de Dados
    return await prisma.occurrence.create({
      data: {
        type: data.type,
        gravity: data.gravity,
        description: data.description,
        measuresTaken: data.measuresTaken, //* Adicionado conforme RF05
        status: "ABERTA", //* Padrão do  enum

        student: {
          connect: {
            id: Number(data.students_Id), // Conecta ao ID do aluno enviado
          },
        },

        user: {
          connect: {
            id: Number(data.users_Id),
          },
        },
      },
    } as any);
  }

  //* Tela 4 — Listar Ocorrências Registradas com Filtros
  async listAll(filters: ListOccurrencesFilters) {
    const whereCondition: any = {};

    //* Filtro por Status da Ocorrência
    if (filters.status) {
      whereCondition.status = filters.status;
    }

    //* Busca por termo (Nome do aluno, tipo da ocorrência, etc.)
    if (filters.search) {
      whereCondition.OR = [
        { type: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        {
          student: { name: { contains: filters.search, mode: "insensitive" } },
        },
      ];
    }

    //* Busca os dados no banco incluindo a tabela de acompanhamentos pedagógicos no plural
    const occurrences = await prisma.occurrence.findMany({
      where: whereCondition,
      include: {
        student: {
          select: {
            name: true,
            registration: true,
            class: {
              select: {
                name: true,
                course: { select: { name: true } },
              },
            },
          },
        },
        user: {
          select: { name: true }, //* Responsável pelo registro inicial
        },
        
        educationalGuidances: {
          include: {
            user: { select: { name: true } }, //* Nome de quem escreveu o acompanhamento
          },
        },
      },
      orderBy: {
        id: "desc", //* Mais recentes primeiro
      },
    } as any);

    //* MAPEAMENTO DINÂMICO: Calcula os campos virtuais em tempo real para cada ocorrência
    return occurrences.map((occ: any) => {
      //* Procura se existe algum texto de ciência no histórico desta ocorrência
      const scienceRow = occ.educationalGuidances?.find((g: any) =>
        g.description?.toLowerCase().includes("tomou ciência"),
      );

      return {
        ...occ,
        // Removemos o histórico bruto do retorno para o JSON ficar limpo se preferir,
        // ou mantém comentando a linha abaixo caso queira listar os textos na tela:
        educationalGuidances: undefined,

        // Injeta os dados calculados que estavam vindo zerados:
        acknowledged: !!scienceRow, // Fica true se achar o texto, false se não achar
        acknowledgedBy: scienceRow ? scienceRow.user?.name : null, // Nome de quem tomou ciência
        acknowledgedAt: scienceRow ? scienceRow.registrationDate : null, // Data exata da ciência
      };
    });
  }
}