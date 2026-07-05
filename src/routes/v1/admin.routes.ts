import { Router } from "express";
import { AdminController } from "../../controllers/adminController";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated";

const adminRoutes = Router();
const adminController = new AdminController();

// 🔒 Ambas as rotas exigem que o administrador esteja autenticado no sistema
adminRoutes.get(
    "/users/pending",
    ensureAuthenticated,
    adminController.listPending,
);
adminRoutes.patch(
    "/users/approve/:id",
    ensureAuthenticated,
    adminController.approve,
);

export { adminRoutes };