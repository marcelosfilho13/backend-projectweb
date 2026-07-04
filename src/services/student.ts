import { prisma } from "../database/prismaClient";

interface listStudentsFilters {
  courses_Id?: number;
  class_Id?: number;
  search?: string;
}

export class StudentService {
  // * Método para listar estudantes com base em filtros opcionais
  async listStudents(filters: listStudentsFilters) {
    const whereCondition: any = {};

    if (filters.courses_Id) whereCondition.courses_Id = filters.courses_Id;
    if (filters.class_Id) whereCondition.class_Id = filters.class_Id;

    // * Se houver um termo de pesquisa, adiciona uma condição para buscar por nome ou email
    if (filters.search) {
      whereCondition.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // * Retorna a lista de estudantes com base nos filtros aplicados, ordenada por nome
    return await prisma.student.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        class_Id: true,
      },
      orderBy: { name: "asc" }, // * Ordena os estudantes por nome em ordem alfabética
    });
  }

  // * Método para obter detalhes de um estudante específico pelo ID
  async getStudentDetails(id: number) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        course: true,
        class: true,
        responsibles: true,
        occurrences: {
          orderBy: { type: "desc" }, // Ordena as ocorrências do estudante por data em ordem decrescente
        },
      },
    });

    if (!student) return null; // Retorna null se o estudante não for encontrado

    // * RN04 Aplicação de regras de negócio para determinar o status do estudante com base no número de ocorrências
    const totalOccurrences = student.occurrences.length;
    let status: "Normal" | "Atenção" | "Encaminhamento Pedagógico" = "Normal";

    if (totalOccurrences >= 3 && totalOccurrences <= 4) {
      status = "Atenção"; // * RN04: Nível de atenção
    }

    if (totalOccurrences >= 5) {
      status = "Encaminhamento Pedagógico"; // * RN04: Encaminhamento pedagógico
    }

    // * Retorna os detalhes do estudante junto com o status calculado
    return {
      ...student,
      status,
    };
  }
}
