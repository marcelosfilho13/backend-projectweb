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
    const includeCondition: any = {
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
            // 👉 AJUSTE REALIZADO AQUI: Mapeamento defensivo para trazer o responsável pelo registro da ocorrência (user ou users)
            ...("user" in prisma.occurrence.fields
            ? { user: { select: { name: true } } }
            : { users: { select: { name: true } } }),
            // 👉 AJUSTE REALIZADO AQUI: Traz o histórico de acompanhamentos pedagógicos em ordem cronológica mapeando dinamicamente a tabela
            ...("educationalGuidance" in prisma.occurrence.fields
            ? {
                educationalGuidance: {
                    orderBy: { id: "asc" },
                    include: {
                    user: { select: { name: true, profile: true } },
                    },
                },
                }
            : "educationalGuidances" in prisma.occurrence.fields
                ? {
                    educationalGuidances: {
                    orderBy: { id: "asc" },
                    include: {
                        user: { select: { name: true, profile: true } },
                    },
                    },
                }
                : {}),
        },
        },
    };

    const student = await prisma.student.findUnique({
        where: { id },
        include: includeCondition, //* Passa o objeto flexibilizado sem travar o compilador
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

    //* Formatação das ocorrências limpando o campo de gravidade e mapeando providências, status da ocorrência, ciência e histórico de acompanhamentos
    const formattedOccurrences = student.occurrences.map((occ: any) => {
        const acompanhamentosRaw =
        occ.educationalGuidance || occ.educationalGuidances || [];

        return {
            id: occ.id,
            type: occ.type,
            description: occ.description,
            data: occ.registrationDate || occ.created_at || occ.createdAt,
            responsavel: occ.user?.name || occ.users?.name || "N/A",
            measuresTaken:
            occ.measuresTaken || "Nenhum registro de providência adotada.",
            status: occ.status || "ABERTO",
            //* Identifica se a equipe já tomou ciência com base no histórico de acompanhamentos
            acknowledged: acompanhamentosRaw.some((a: any) =>
                a.description?.toLowerCase().includes("tomou ciência"),
            )
            ? "CIENTE"
            : "PENDENTE",
            historicoAcompanhamentos: acompanhamentosRaw.map((a: any) => ({
                id: a.id,
                texto: a.description,
                data: a.registrationDate || a.createdAt,
                autor: a.user?.name || "N/A",
                perfilAutor: a.user?.profile || "N/A",
            })),
        };
    });

    //* Retorna a ficha unificada completa
    return {
        ...student,
        occurrences: formattedOccurrences, //* Lista formatada com a nova regra de exibição
        status_disciplinar: status,
    };
    }
}