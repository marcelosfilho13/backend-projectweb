import { Request, Response } from "express";
import { StudentService } from "../services/student";

const studentService = new StudentService();

export class StudentController {
    // * GET /api/v1/students - Listar todos os estudantes com filtros opcionais
    async listStudents(req: Request, res: Response) {
        try {
            const {name, class_Id, search} = req.query;

            const students = await studentService.listStudents({
                courses_Id: name ? Number(name) : undefined,
                class_Id: class_Id ? Number(class_Id) : undefined,
                search: search ? String(search) : undefined,
            });

            return res.status(200).json(students);
        } catch (error) {
            console.error("🚨 Error in StudentController.index:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    // * GET /api/v1/students/:id - Obter detalhes de um estudante específico pelo ID
    async show(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const studentDetails = await studentService.getStudentDetails(Number(id));

            if (!studentDetails) {
                return res.status(404).json({ error: "Student not found" });
            }

            return res.status(200).json(studentDetails);
        } catch (error) {
            console.error("🚨 Error in StudentController.show:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}