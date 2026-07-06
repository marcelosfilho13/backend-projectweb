import { Router } from "express";
import { OccurrenceController } from "../../controllers/occurrenceController.js"
import { checkRole } from "../../middlewares/rbac";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";

const occurrenceRoutes = Router();
const occurrenceController = new OccurrenceController();

//* POST /api/v1/occurrences/create - Criar uma nova ocorrência disciplinar
//* RF05 / RN01 / RN02: Ação exclusiva do perfil Administrador
occurrenceRoutes.post(
  "/",
  ensureAuthenticated,
  checkRole(["Administrador"]),
  occurrenceController.create,
);

//* GET /api/v1/occurrences - Listar todas as ocorrências com filtros (Tabela da Tela 4)
//* ompartilhada com os demais perfis para consulta e acompanhamento
occurrenceRoutes.get(
  "/",
  ensureAuthenticated,
  checkRole(["Administrador", "Setor Pedagógico", "Servidor"]),
  occurrenceController.listAll,
);

//* DELETE /api/v1/occurrences/:id - Excluir uma ocorrência específica pelo ID
//* RN03: Ocorrências podem ser excluídas, mas somente pelo perfil Administrador
occurrenceRoutes.delete(
  "/:id",
  ensureAuthenticated,
  checkRole(["Administrador"]),
  occurrenceController.delete,
);

export { occurrenceRoutes };