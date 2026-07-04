import { Router } from "express";
import { OccurrenceController } from "../../controllers/occurrenceController";

import { checkRole } from "../../middlewares/rbac";
import { ensureAuthenticated } from "../../middlewares/ensureAuthenticated"; // Seu middleware de JWT existente

const occurrenceRoutes = Router();
const occurrenceController = new OccurrenceController();


// *POST /api/v1/occurrences - Rota para criar uma nova ocorrência disciplinar
occurrenceRoutes.post("/", 
    ensureAuthenticated, //! 1º: Abre o cadeado do token e injeta o req.user
    checkRole(["Administrador"]), //! 2º: Garante que apenas o Pátio ou Admin criem o registo
  occurrenceController.create
);

export { occurrenceRoutes };