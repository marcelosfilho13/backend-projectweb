import {Router} from "express";

const studentRoutes = Router();

// *GET /api/v1/students - Rota para listar todos os estudantes
studentRoutes.get("/", (req, res) => {
    // Lógica para listar todos os estudantes
    return res.status(200).json({ message: "Lista de estudantes estruturada" });
});

// *GET /api/v1/students/:id - Rota para obter um estudante específico pelo ID
studentRoutes.get("/:id", (req, res) => {
    const { id } = req.params;
    // Lógica para obter um estudante específico pelo ID
    return res.status(200).json({ message: `Detalhes do estudante com ID ${id}` });
});

export { studentRoutes };

