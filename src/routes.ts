import Router from "express";
import { UserController } from "./controllers/userController";
import { ensureAuthenticated } from "./middlewares/ensureAuthenticated";

const routes = Router();
const userController = new UserController();

routes.post("/users", userController.register); //* Rota de cadastro de usuário
routes.post("/users/login", userController.login); //* Rota de login de usuário

//* Rota protegida: Só entra quem tem o Token JWT válido
routes.get("/dashboard", ensureAuthenticated, (req, res) => {
    return res.status(200).json({ 
    message: "Parabéns! Você está autenticado e logado no sistema." 
  });
});

export { routes };
