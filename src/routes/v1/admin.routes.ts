import { Router } from "express";
import { AdminController } from "../../controllers/adminController";
import { checkRole } from "../../middlewares/rbac";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";

const adminRoutes = Router();
const adminController = new AdminController();

//*Aplica a trava global de Administrador autenticado para todas as rotas deste arquivo
adminRoutes.use(ensureAuthenticated);
adminRoutes.use(checkRole(["Administrador"]));


//* ABA 1: ALUNOS

// * POST /api/v1/admin/students - Cadastrar Aluno
adminRoutes.post("/students", adminController.storeStudent);

// * DELETE /api/v1/admin/students/:id - Remover Aluno
adminRoutes.delete("/students/:id", adminController.destroyStudent);

//*ABA 2: CURSOS & TURMAS

// * POST /api/v1/admin/courses - Cadastrar Curso
adminRoutes.post("/courses", adminController.storeCourse);

// * DELETE /api/v1/admin/courses/:id - Remover Curso
adminRoutes.delete("/courses/:id", adminController.destroyCourse);

// * POST /api/v1/admin/classes - Cadastrar Turma
adminRoutes.post("/classes", adminController.storeClass);

// * DELETE /api/v1/admin/classes/:id - Remover Turma
adminRoutes.delete("/classes/:id", adminController.destroyClass);


//* 🔒 ABA 3: USUÁRIOS

// * GET /api/v1/admin/users/pending - Listar solicitações de acesso pendentes
adminRoutes.get("/users/pending", adminController.listPending);

// * PATCH /api/v1/admin/users/:id/approve - Aprovar usuário e definir perfil final
adminRoutes.patch("/users/:id/approve", adminController.updateApproval);

// * DELETE /api/v1/admin/users/:id - Remover usuário aprovado ou recusar solicitação
adminRoutes.delete("/users/:id", adminController.destroyUser);

export { adminRoutes };