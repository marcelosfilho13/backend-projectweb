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
        measuresTaken: data.measuresTaken || "Nenhuma providência registrada inicialmente.",
        students_Id: data.students_Id,
        users_Id: data.users_Id,
        status: "ABERTO", //* Inicializa com o padrão exigido pelo sistema
        //* Mantém a flag caso exista no seu schema, usando a verificação corrigida
        ...("alertForPedagogicalAction" in prisma.occurrence.fields
          ? { alertForPedagogicalAction: isGrave }
          : {}),
      },
    });
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
        students: {
          select: {
            name: true,
            registration: true,
            course: { select: { name: true } },
          },
        },
        user: {
          select: { name: true }, //* Responsável pelo registro
        },
      },
      orderBy: {
        id: "desc", //* Mais recentes primeiro
      },
    });
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
