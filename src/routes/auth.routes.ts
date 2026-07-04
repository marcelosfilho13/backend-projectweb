import {Router} from "express";
import { AuthController } from "../controllers/authController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const authRoutes = Router();
const authController = new AuthController();

//* Rota Pública (Qualquer um pode tentar logar)
authRoutes.post("/login", authController.login);

//* Rota Protegida (Só quem tem um token válido pode cadastrar um novo servidor)
authRoutes.post("/register", ensureAuthenticated, authController.register);

export { authRoutes };