import {Router} from "express";
import { AuthController } from "../controllers/authController";


const authRoutes = Router();
const authController = new AuthController();

//* Rota Pública (Qualquer um pode tentar logar)
authRoutes.post("/login", authController.login);

//* Rota Pública (Só quem tem um token válido pode cadastrar um novo servidor)
authRoutes.post("/register", authController.register);

export { authRoutes }