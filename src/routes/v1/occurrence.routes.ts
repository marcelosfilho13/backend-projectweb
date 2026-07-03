import { Router } from "express";
import { OccurrenceController } from "../../controllers/occurrenceController";

//! import { checkRole } from "../../middlewares/rbac.middleware";
//! import { ensureAuthenticated } from "../../middlewares/auth.middleware"; // Seu middleware de JWT existente

const occurrenceRoutes = Router();
const occurrenceController = new OccurrenceController();


// *POST /api/v1/occurrences - Rota para criar uma nova ocorrência disciplinar
occurrenceRoutes.post("/", 
    // ensureAuthenticated, // 1º: Abre o cadeado do token e injeta o req.user
    // checkRole(["PATIO", "ADMIN"]), // 2º: Garante que apenas o Pátio ou Admin criem o registo
  occurrenceController.create
);

export { occurrenceRoutes };