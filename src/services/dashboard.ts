import {PrismaClient} from "../../generated/prisma";

const prisma = new PrismaClient();

interface DashboardFilters {
    courses_Id?: number;
    class_Id?: number;
}

export class DashboardService {
    async getStats(filters: DashboardFilters){
        
        // * Construindo a condição WHERE dinamicamente com base nos filtros fornecidos
        const whereCondition: any = {};
        if (filters.courses_Id) whereCondition.courses_Id = filters.courses_Id;
        if (filters.class_Id) whereCondition.class_Id = filters.class_Id;

        // * Consultando o banco de dados para obter as estatísticas
        const [totalStudents, totalOccurrences] = await Promise.all([
            prisma.student.count({ where: whereCondition }),
            prisma.occurrence.count({ 
                where: {
                    students: whereCondition, // Aplicando os mesmos filtros para ocorrências    
                } 
            }),     
        ]);

        const studentsWithOccurrences = await prisma.student.findMany({
            where: whereCondition,
            select: {
                id: true,
                _count: {
                    select: { occurrences: true }
                },
            },
        });

        let normalCount = 0;
        let attentionCount = 0;
        let pedagogicalCount = 0;

        studentsWithOccurrences.forEach(student => {
            const occurrenceCount = student._count.occurrences;
            if (occurrenceCount === 0 && occurrenceCount <= 2) {
                normalCount++;
            } else if (occurrenceCount >= 3 && occurrenceCount <= 5) {
                attentionCount++; // *RN04: Nível de atenção
            } else if (occurrenceCount > 5) {
                pedagogicalCount++; // *RN04: Encaminhamento pedagógico
            }
        });

        return {
            totalStudents,
            totalOccurrences,
            normalCount,
            attentionCount,
            pedagogicalCount
        }
    }
}