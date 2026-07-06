import { Request, Response } from "express";
import { StudentService } from "../services/student.js";

const studentService = new StudentService();

export class StudentController {
    // * GET /api/v1/students - Listar todos os estudantes com filtros opcionais (RF03 - Lado Esquerdo)
    async listStudents(req: Request, res: Response) {
    try {
        const { courses_Id, class_Id, search } = req.query;

        const students = await studentService.listStudents({
            courses_Id: courses_Id ? Number(courses_Id) : undefined,
            class_Id: class_Id ? Number(class_Id) : undefined,
            search: search ? String(search) : undefined,
        });

        return res.status(200).json(students);
    } catch (error) {
            console.error("🚨 Error in StudentController.listStudents:", error);
            return res.status(500).json({
            error: "Internal Server Error",
            message: "Erro ao carregar a listagem de alunos.",
        });
    }
    }

    // * GET /api/v1/students/:id - Obter a ficha/detalhes do estudante (RF04 - Lado Direito)
    async show(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const studentDetails = await studentService.getStudentDetails(Number(id));

        if (!studentDetails) {
            return res.status(404).json({ error: "Aluno não encontrado." });
        }

        return res.status(200).json(studentDetails);
    } catch (error) {
            console.error("🚨 Error in StudentController.show:", error);
            return res.status(500).json({
            error: "Internal Server Error",
            message: "Erro ao obter o histórico detalhado do aluno.",
        });
    }
    }
}
