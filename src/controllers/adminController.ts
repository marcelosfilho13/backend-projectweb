import { Request, Response } from "express";
import { AdminService } from "../services/admin.js";

const adminService = new AdminService();

export class AdminController {
  //* ABA 1: ALUNOS

    async storeStudent(req: Request, res: Response) {
        try {
            const { name, registration, courses_Id, class_Id } = req.body;

            if (!name || !registration || !courses_Id || !class_Id) {
            return res
                .status(400)
                .json({ error: "Todos os campos do aluno são obrigatórios." });
            }

            const student = await adminService.createStudent({
                name,
                registration,
                courses_Id: Number(courses_Id),
                class_Id: Number(class_Id),
            });

            return res
            .status(201)
            .json({ message: "Aluno cadastrado com sucesso.", data: student });
        } catch (error: any) {
                console.error("🚨 Error in AdminController.storeStudent:", error);
                return res
                .status(500)
                .json({
                    error: "Internal Server Error",
                    message: "Erro ao cadastrar aluno.",
                });
        }
    }

    async destroyStudent(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await adminService.deleteStudent(Number(id));
            return res.status(200).json({ message: "Aluno removido com sucesso." });
        } catch (error: any) {
            console.error("🚨 Error in AdminController.destroyStudent:", error);
            if (error.message === "Aluno não encontrado.") {
                return res.status(404).json({ error: error.message });
            }
            return res
                .status(500)
                .json({
                error: "Internal Server Error",
                message: "Erro ao remover aluno.",
                });
        }
    }

  //* ABA 2: CURSOS & TURMAS

    async storeCourse(req: Request, res: Response) {
        try {
        const { name, description } = req.body;

        if (!name) {
            return res
            .status(400)
            .json({ error: "O nome do curso é obrigatório." });
        }

        const course = await adminService.createCourse({ name, description });
        return res
            .status(201)
            .json({ message: "Curso cadastrado com sucesso.", data: course });
        } catch (error) {
        console.error("🚨 Error in AdminController.storeCourse:", error);
        return res
            .status(500)
            .json({
            error: "Internal Server Error",
            message: "Erro ao cadastrar curso.",
            });
        }
    }

    async destroyCourse(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await adminService.deleteCourse(Number(id));
            return res.status(200).json({ message: "Curso removido com sucesso." });
        } catch (error) {
            console.error("🚨 Error in AdminController.destroyCourse:", error);
            return res
                .status(500)
                .json({
                error: "Internal Server Error",
                message: "Erro ao remover curso.",
                });
        }
    }

    async storeClass(req: Request, res: Response) {
        try {
            const { name, courses_Id } = req.body;

        if (!name || !courses_Id) {
            return res
            .status(400)
            .json({ error: "O nome da turma e o ID do curso são obrigatórios." });
        }

        const currentClass = await adminService.createClass({
            name,
            courses_Id: Number(courses_Id),
        });

        return res
            .status(201)
            .json({ message: "Turma cadastrada com sucesso.", data: currentClass });
        } catch (error) {
            console.error("🚨 Error in AdminController.storeClass:", error);
            return res
                .status(500)
                .json({
                error: "Internal Server Error",
                message: "Erro ao cadastrar turma.",
                });
        }
    }

    async destroyClass(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await adminService.deleteClass(Number(id));
            return res.status(200).json({ message: "Turma removida com sucesso." });
        } catch (error) {
            console.error("🚨 Error in AdminController.destroyClass:", error);
            return res
                .status(500)
                .json({
                error: "Internal Server Error",
                message: "Erro ao remover turma.",
                });
        }
    }

  //* ABA 3: USUÁRIOS

    async listPending(req: Request, res: Response) {
        try {
            const pendingUsers = await adminService.getPendingUsers();
            return res.status(200).json(pendingUsers);
        } catch (error) {
            console.error("🚨 Error in AdminController.listPending:", error);
            return res
            .status(500)
            .json({
                error: "Internal Server Error",
                message: "Erro ao listar solicitações pendentes.",
            });
        }
    }

    async updateApproval(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { perfil } = req.body; // Perfil final que o Administrador definiu (ex: "Setor Pedagógico")

        if (!perfil) {
        return res
            .status(400)
            .json({
            error:
                "É necessário definir o perfil de acesso final para aprovação.",
            });
        }

        const approvedUser = await adminService.approveUser({
            userId: Number(id),
            perfil: String(perfil), 
        });
        return res
        .status(200)
        .json({
            message: "Usuário aprovado e liberado com sucesso.",
            data: approvedUser,
        });
    } catch (error: any) {
        console.error("🚨 Error in AdminController.updateApproval:", error);
        if (error.message === "Usuário não encontrado.") {
            return res.status(404).json({ error: error.message });
        }
        return res
        .status(500)
        .json({
            error: "Internal Server Error",
            message: "Erro ao processar aprovação.",
        });
    }
    }

    async destroyUser(req: Request, res: Response) {
    try {
        const { id } = req.params;

        await adminService.deleteUser(Number(id));
        return res
        .status(200)
        .json({ message: "Usuário removido/recusado com sucesso." });
    } catch (error: any) {
        console.error("🚨 Error in AdminController.destroyUser:", error);
        if (error.message === "Usuário não encontrado.") {
            return res.status(404).json({ error: error.message });
        }
        return res
        .status(500)
        .json({
            error: "Internal Server Error",
            message: "Erro ao remover usuário.",
        });
    }
    }
}