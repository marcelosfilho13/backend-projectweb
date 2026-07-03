import {Router} from "express";
import { DashboardController } from "../../controllers/dashboardController";
//!import {checkRole} from "../../middlewares/checkRole";

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

// GET /api/v1/dashboard/stats
dashboardRoutes.get(
  "/stats",
  // ensureAuthenticated, // Descomente para ativar a validação do Token JWT real
  //!checkRole(["Administrador", "Setor Pedagógico", "Servidor"]), // Permissão para todos os setores mapeados
  dashboardController.getStats
);

export { dashboardRoutes };