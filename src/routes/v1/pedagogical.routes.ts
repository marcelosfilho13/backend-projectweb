import { Router } from "express";
import { PedagogicalController } from "../../controllers/pedagogicalController.js";
import { checkRole } from "../../middlewares/rbac";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated"; // 2. Descomentado e sincronizado

const pedagogicalRoutes = Router();
const pedagogicalController = new PedagogicalController();

//* GET /api/v1/pedagogical/occurrence/:occurrenceId - Carregar histórico do Painel
//* Aberto a todos os perfis permitidos na Tela 4 para consulta e visualização
pedagogicalRoutes.get(
    "/occurrence/:occurrenceId",
    ensureAuthenticated,
    checkRole(["Administrador", "Setor Pedagógico", "Servidor"]),
    pedagogicalController.getPanelDetails,
);

//* POST /api/v1/pedagogical/occurrence/:occurrenceId/followup - Registrar acompanhamento/atualizar status
//* Restrito apenas à Equipe Pedagógica e ao Administrador (Conforme RF07)
pedagogicalRoutes.post(
    "/occurrence/:occurrenceId/followup",
    ensureAuthenticated,
    checkRole(["Administrador", "Setor Pedagógico"]),
    pedagogicalController.storeFollowUp,
);

//* PATCH /api/v1/pedagogical/occurrence/:occurrenceId/acknowledge - Tomar Ciência rápida
//* Ação exclusiva da Equipe Pedagógica (Conforme RF07)
pedagogicalRoutes.patch(
    "/occurrence/:occurrenceId/acknowledge",
    ensureAuthenticated,
    checkRole(["Setor Pedagógico"]),
    pedagogicalController.acknowledge,
);

export { pedagogicalRoutes };