import { prisma } from "../database/prismaClient";

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

    return await prisma.occurrence.findMany({
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
          select: { name: true }, //* Responsável pelo registro
        },
      },
      orderBy: {
        id: "desc", //* Mais recentes primeiro
      },
    } as any);
  }

  //* RN03 — Excluir Ocorrência
  async delete(id: number) {
    const occurrenceExists = await prisma.occurrence.findUnique({
      where: { id },
    });

    if (!occurrenceExists) {
      throw new Error("Ocorrência não encontrada.");
    }

    return await prisma.occurrence.delete({
      where: { id },
    });
  }
}