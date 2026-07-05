import { prisma } from "../database/prismaClient";

interface listStudentsFilters {
    courses_Id?: number;
    class_Id?: number;
    search?: string;
}

export class StudentService {
  //* RF03 — Consulta de Alunos (Listagem do lado esquerdo da tela)
    async listStudents(filters: listStudentsFilters) {
    const whereCondition: any = {};

    if (filters.courses_Id) whereCondition.courses_Id = filters.courses_Id;
    if (filters.class_Id) whereCondition.class_Id = filters.class_Id;

    // * Adiciona busca flexível por nome ou matrícula (conforme RF03)
    if (filters.search) {
        whereCondition.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        //* Tenta buscar no campo registration/enrollment. Usamos mapeamento seguro via any
        { registration: { contains: filters.search, mode: "insensitive" } },
        ];
    }

    //* Retorna a lista trazendo dados mínimos, incluindo curso e turma para exibição direta
    const students = await prisma.student.findMany({
        where: whereCondition,
        select: {
        id: true,
        name: true,
        [prisma.student.fields ? "registration" : "id"]: true,
        course: {
            select: { name: true },
        },
        class: {
            select: { name: true },
        },
        },
        orderBy: { name: "asc" }, //* Ordena os estudantes por nome em ordem alfabética
    });

    return students;
    }

    //* RF04 — Visualização da Ficha do Aluno (Detalhes do lado direito da tela)
    async getStudentDetails(id: number) {
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
        course: true,
        class: true,
        responsibles: true, //* Responsáveis (RF04)
        occurrences: {
            orderBy: {
            //* Tentativa dinâmica usando as colunas prováveis do banco mapeadas anteriormente
            [prisma.occurrence.fields ? "created_at" : "id"]: "desc",
            },
            include: {
            //* Inclui dados de acompanhamento/ciência para o card expansível do front-end
            users: { select: { name: true } }, //* Responsável pela ocorrência
            },
        },
        },
    });

    if (!student) return null;

    // * RN04: Determinar o nível de atenção disciplinar com base nas ocorrências
    const totalOccurrences = student.occurrences.length;
    let status: "Normal" | "Atenção" | "Encaminhamento Pedagógico" = "Normal";

    if (totalOccurrences >= 3 && totalOccurrences <= 4) {
        status = "Atenção";
    } 
    
    if (totalOccurrences >= 5) {
        status = "Encaminhamento Pedagógico";
    }
    
    //* Retorna a ficha unificada completa
    return {
        ...student,
        status_disciplinar: status,
    };
    }
}
