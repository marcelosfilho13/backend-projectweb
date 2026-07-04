import { Router } from "express";
import { PedagogicalController } from "../../controllers/pedagogicalController";
import { checkRole } from "../../middlewares/rbac";
// import { ensureAuthenticated } from "../../middlewares/auth.middleware"; // Seu middleware de JWT existente

const pedagogicalRoutes = Router();
const pedagogicalController = new PedagogicalController();

//* GET /api/v1/pedagogical/attention - fila restrita ao pedagógico
pedagogicalRoutes.get(
    "attention",
    // ensureAuthenticated
    checkRole(["Setor Pedagógico", "Administrador"]),
    pedagogicalController.getQueue
);

//* POST api/v1/´pedagogical/forwarding - Registro restrito ao Pedagógico
pedagogicalRoutes.post(
    "/forwarding",
    // ensureAuthenticated
    checkRole(["Setor Pedagógico", "Administrador"]),
    pedagogicalController.storeForwarding
);

export {pedagogicalRoutes}