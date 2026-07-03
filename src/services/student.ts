import {PrismaClient} from "../../generated/prisma";

const prisma = new PrismaClient();

interface listStudentsFilters {
    courses_Id?: number;
    class_Id?: number;
    search?: string;
}

