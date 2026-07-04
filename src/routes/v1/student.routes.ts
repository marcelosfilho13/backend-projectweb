import {Router} from "express";
import { StudentController } from "../../controllers/studentController";
import {checkRole} from "../../middlewares/rbac"
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";


const studentRoutes = Router();
const studentController = new StudentController();


// *GET /api/v1/students - Rota para listar todos os estudantes protegida por autenticação e autorização
studentRoutes.get(
    "/", 
    ensureAuthenticated, 
    checkRole(["Administrador", "Setor Pedagógico", "Servidor"]), // Permissão para todos os setores mapeados
    studentController.listStudents
);

// *GET /api/v1/students/:id - Rota para obter um estudante específico pelo ID
studentRoutes.get(
    "/:id", 
    //ensureAuthenticated, 
    //!checkRole(["Administrador", "Setor Pedagógico", "Servidor"]), // Permissão para todos os setores mapeados
    studentController.show
);

export { studentRoutes };

