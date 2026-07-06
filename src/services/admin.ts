import { prisma } from "../database/prismaClient.js";

interface CreateStudentDTO {
    name: string;
    registration: string;
    courses_Id: number;
    class_Id: number;
}

interface CreateCourseDTO {
    name: string;
    description: string;
}

interface CreateClassDTO {
    name: string;
    courses_Id: number;
}
export class AdminService {
    //* ABA 1: ALUNOS (Cadastrar e Remover)
    async createStudent(data: CreateStudentDTO) {
        const { name, registration, class_Id } = data;

        return await prisma.student.create({
            data: {
            name: name,
            registration: registration,

            class: {
                connect: {
                //* Conecta o aluno ao ID numérico da turma enviado no Insomnia
                id: Number(class_Id),
                },
            },
            },
        });
    }

    async deleteStudent(id: number) {
        const studentExists = await prisma.student.findUnique({ where: { id } });
        if (!studentExists) throw new Error("Aluno não encontrado.");

        return await prisma.student.delete({ where: { id } });
    }

    //* ABA 2: CURSOS & TURMAS (Cadastrar e Remover)
    async createCourse(data: CreateCourseDTO) {
        const courseData: any = {
            name: data.name,
        };

    //* Verifica dinamicamente se o campo description existe no modelo antes de atribuir
        if ("description" in prisma.course.fields) {
        courseData.description = data.description || ""; // Garante uma string vazia caso venha undefined para não quebrar a obrigatoriedade
        }

        return await prisma.course.create({
                data: courseData,
            });
    }

    async deleteCourse(id: number) {
        return await prisma.course.delete({ where: { id } });
    }

    async createClass(data: CreateClassDTO) {
        const classData: any = {
            name: data.name,
            ...("courses_Id" in prisma.class.fields
            ? { courses_Id: data.courses_Id }
            : { courseId: data.courses_Id }),
        };

        return await prisma.class.create({
            data: classData,
        });
    }

    async deleteClass(id: number) {
        return await prisma.class.delete({ where: { id } });
    }

  //* ABA 3: USUÁRIOS (Aprovar, Recusar e Remover)

  //* Listar solicitações de acesso pendentes
    async getPendingUsers() {
        const userFields = prisma.user.fields;
        const whereCondition: any = {};

        // Define o filtro de pendência adaptando-se ao seu Schema do Prisma
        if ("status" in userFields) whereCondition.status = "PENDENTE";
        else if ("approved" in userFields) whereCondition.approved = false;
        else if ("active" in userFields) whereCondition.active = false;

        return await prisma.user.findMany({
            where: whereCondition,
            select: {
            id: true,
            name: true,
            email: true,
            ...("profile" in userFields ? { profile: true } : {}),
            },
        });
    }

  //* Aprovar usuário definindo seu perfil de acesso final
    async approveUser({ userId, perfil }: { userId: number; perfil: string }) {
        return await prisma.user.update({
            where: {
            id: Number(userId), // Garante que o ID é um número
            },
            data: {
            //* Altera o status para ATIVO 
            ...("status" in prisma.user.fields ? { status: "ATIVO" } : {}),
            perfil: perfil, //* Salva o Perfil
            },
        });
    }

    // Recusar ou Remover um usuário do sistema permanentemente
    async deleteUser(id: number) {
        const userExists = await prisma.user.findUnique({ where: { id } });
        if (!userExists) throw new Error("Usuário não encontrado.");

        return await prisma.user.delete({ where: { id } });
    }
}