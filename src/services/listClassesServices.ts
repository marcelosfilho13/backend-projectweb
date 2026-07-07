import { prisma } from "../database/prismaClient.js";

export class ListClassesService {
    async execute() {
    const classes = await prisma.class.findMany({
        include: {
        course: true, // Já traz os dados do curso atrelado à turma
        },
        orderBy: { name: "asc" },
    });
    return classes;
    }
}
