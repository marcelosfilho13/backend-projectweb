import {prisma} from "../database/prismaClient.js"

export class ListCoursesService {
    async execute() {
    const courses = await prisma.course.findMany({
        orderBy: { name: "asc" },
    });
    return courses;
    }
}
