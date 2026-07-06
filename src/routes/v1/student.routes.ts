import {Router} from "express";
import { StudentController } from "../../controllers/studentController.js";
import {checkRole} from "../../middlewares/rbac"
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";

const studentRoutes = Router();
const studentController = new StudentController();

//* GET /api/v1/students - Listar todos os estudantes (RF03 - Lado Esquerdo)
studentRoutes.get(
    "/",
    ensureAuthenticated,
    checkRole(["Administrador", "Setor Pedagógico", "Servidor"]),
    studentController.listStudents,
);

//* GET /api/v1/students/:id - Ficha/Histórico detalhado do aluno (RF04 - Lado Direito)
studentRoutes.get(
    "/:id",
    ensureAuthenticated, 
    checkRole(["Administrador", "Setor Pedagógico", "Servidor"]), // 3. Corrigido e ativado
    studentController.show,
);

export { studentRoutes };