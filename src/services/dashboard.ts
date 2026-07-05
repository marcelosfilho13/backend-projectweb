// 1. Mantendo APENAS a importação inicial solicitada
import { prisma } from "../database/prismaClient";

interface DashboardFilters {
    courses_Id?: number;
    class_Id?: number;
}

export class DashboardService {
    async getStats(filters: DashboardFilters, userPerfil: string) {
        // * Construindo a condição WHERE dinamicamente com base nos filtros
        const whereCondition: any = {};
        if (filters.courses_Id) whereCondition.courses_Id = filters.courses_Id;
        if (filters.class_Id) whereCondition.class_Id = filters.class_Id;

        // * Condição para ocorrências filtrarem pelo aluno correspondente
        const occurrenceWhere: any = {
            student: whereCondition,
        };

        // * Executa contagens básicas em paralelo para otimizar a performance
        const [totalStudents, totalOccurrences, totalOpenOccurrences] =
            await Promise.all([
            prisma.student.count({ where: whereCondition }),
            prisma.occurrence.count({ where: occurrenceWhere }),
            prisma.occurrence.count({
                where: {
                ...occurrenceWhere,
                // 3. Acessando o Enum diretamente através da instância do seu cliente centralizado
                status: "ABERTO",
                },
            }),
            ]);

        let totalCourses: number | undefined = undefined;
        let totalClasses: number | undefined = undefined;

    // 🔒 Regra de Negócio: Cards visíveis somente para o perfil Administrador
    if (userPerfil === "Administrador") {
        const [coursesCount, classesCount] = await Promise.all([
        prisma.course.count(),
        prisma.class.count(),
        ]);
        totalCourses = coursesCount;
        totalClasses = classesCount;
    }

        // * Tabela com as 5 ocorrências mais recentes
        const recentOccurrences = await prisma.occurrence.findMany({
            where: occurrenceWhere,
            take: 5,
            orderBy: {
            registrationDate: "desc"
            },
            select: {
            id: true,
            type: true,
            created_at: true,
            status: true,
            student: {
                select: { name: true },
            },
            user: {
                select: { name: true },
            },
            },
        });

        //* Formata o retorno das ocorrências para simplificar a leitura no frontend
        const formattedOccurrences = recentOccurrences.map((occ: any) => ({
            id: occ.id,
            aluno: occ.student?.name || "N/A",
            tipo: occ.type,
            data: occ.createdAt,
            responsavel: occ.user?.name || "N/A",
            status: occ.status,
        }));

        //* Retorna o payload estruturado exatamente como a regra de negócio do RF02 pede
        return {
            totalStudents,
            totalOccurrences,
            totalOpenOccurrences,
            ...(userPerfil === "Administrador" && { totalCourses, totalClasses }),
            recentOccurrences: formattedOccurrences,
        };
    }
}
