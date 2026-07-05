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

        // 🟢 Ajustado filtros para respeitar a estrutura relacional do seu banco
        if (filters.class_Id) {
        whereCondition.classId = Number(filters.class_Id);
        }

        if (filters.courses_Id) {
        whereCondition.class = {
        courseId: Number(filters.courses_Id),
        };
        }

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
            where: whereCondition, // 🟢 Aplicado a condição de busca estruturada acima
            select: {
            id: true,
            name: true,
            registration: true,
            class: {
                select: {
                name: true, // Nome da Turma
                ...("course" in (prisma as any).class?.fields || true
                    ? {
                        course: {
                        select: {
                            name: true, // Nome do Curso vindo da relação da Turma
                        },
                        },
                    }
                    : {}),
                },
            },
            },
            orderBy: {
            name: "asc",
            },
        } as any); // Adicionamos 'as any' para o TypeScript não chiar com o select dinâmico

        return students;
    }

  //* RF04 — Visualização da Ficha do Aluno (Detalhes do lado direito da tela)
    async getStudentDetails(id: number) {
        const student = await prisma.student.findUnique({
            where: {
            id: Number(id), // Agora o 'id' existe aqui!
            },
            include: {
            class: {
                include: {
                course: true,
                },
            },
            responsibles: true,
            occurrences: {
                orderBy: { id: "desc" },
                include: {
                // 👉 Ajuste defensivo: puxa o autor da ocorrência (user ou users)
                ...("user" in (prisma as any).occurrence?.fields || true
                    ? { user: { select: { name: true } } }
                    : { users: { select: { name: true } } }),

                // 👉 Ajuste defensivo: traz o histórico de acompanhamentos pedagógicos
                ...("educationalGuidance" in (prisma as any).occurrence?.fields
                    ? {
                        educationalGuidance: {
                        orderBy: { id: "asc" },
                        include: {
                            user: { select: { name: true, perfil: true } }, // Alterado para 'perfil'
                        },
                        },
                    }
                    : {
                        educationalGuidances: {
                        orderBy: { id: "asc" },
                        include: {
                            user: { select: { name: true, perfil: true } }, // Alterado para 'perfil'
                        },
                        },
                    }),
                },
            },
            },
        } as any);

        if (!student) return null;

        // * RN04: Determinar o nível de atenção disciplinar com base nas ocorrências
        const listaOcorrencias = (student as any).occurrences || (student as any).occurrence || [];
        const totalOccurrences = listaOcorrencias.length;
        let status: "Normal" | "Atenção" | "Encaminhamento Pedagógico" = "Normal";

        if (totalOccurrences >= 3 && totalOccurrences <= 4) {
            status = "Atenção";
        }

        if (totalOccurrences >= 5) {
            status = "Encaminhamento Pedagógico";
        }

        //* Formatação das ocorrências limpando o campo de gravidade e mapeando providências, status da ocorrência, ciência e histórico de acompanhamentos
        const formattedOccurrences = listaOcorrencias.map((occ: any) => {
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
        status: occ.status || "ABERTA",
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
            perfilAutor: a.user?.perfil || a.user?.profile || "N/A", // Aceita perfil ou profile no mapeamento final
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