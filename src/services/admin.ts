import { prisma } from "../database/prismaClient";

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
        return await prisma.student.create({
        data: {
            name: data.name,
            //* Procura dinamicamente o nome do campo de matrícula (registration ou enrollment)
            ...("registration" in prisma.student.fields
            ? { registration: data.registration }
            : { enrollment: data.registration }),
            courses_Id: data.courses_Id,
            class_Id: data.class_Id,
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
    // 👉 AJUSTE REALIZADO AQUI: Criando o objeto como 'any' e injetando dinamicamente o mapeamento de chave estrangeira aceito pelo seu banco
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
    async approveUser(id: number, finalProfile: string) {
        const userExists = await prisma.user.findUnique({ where: { id } });
        if (!userExists) throw new Error("Usuário não encontrado.");

        const userFields = prisma.user.fields;
        const updateData: any = {};

        // Injeta o perfil (Role) escolhido pelo Administrador
        if ("profile" in userFields) updateData.profile = finalProfile;
        if ("role" in userFields) updateData.role = finalProfile;

        //* Altera o status de aprovação baseado nos campos do seu banco
        if ("status" in userFields) updateData.status = "ATIVO";
        if ("approved" in userFields) updateData.approved = true;
        if ("active" in userFields) updateData.active = true;

        return await prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    // Recusar ou Remover um usuário do sistema permanentemente
    async deleteUser(id: number) {
        const userExists = await prisma.user.findUnique({ where: { id } });
        if (!userExists) throw new Error("Usuário não encontrado.");

        return await prisma.user.delete({ where: { id } });
    }
}