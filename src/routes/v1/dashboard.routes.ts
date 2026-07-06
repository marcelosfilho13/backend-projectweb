import { Router } from "express";
import { DashboardController } from "../../controllers/dashboardController.js";
import { checkRole } from "../../middlewares/rbac";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

//* GET /api/v1/dashboard/stats
dashboardRoutes.get(
  "/stats",
  ensureAuthenticated, //* OBRIGATÓRIO: Ative para que o perfil do usuário seja extraído do JWT e injetado na requisição
  checkRole(["Administrador", "Setor Pedagógico", "Servidor"]), //* Valida se o perfil logado tem permissão de rota
  dashboardController.getStats,
);

export { dashboardRoutes };
