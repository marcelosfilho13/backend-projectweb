import {Router} from "express";

const authRoutes = Router();

authRoutes.post("/login", (req, res) => {
    // Lógica de autenticação do usuário
    return res.status(200).json({ message: "Usuário autenticado com sucesso!" });
});

export { authRoutes };