import { Router } from "express";

const occurrenceRoutes = Router();

// *POST /api/v1/occurrences - Rota para criar uma nova ocorrência disciplinar
occurrenceRoutes.post("/", (req, res) => {
    // Lógica para criar uma nova ocorrência
    return res.status(201).json({ message: "Nova ocorrência criada com sucesso!" });
});

export { occurrenceRoutes };