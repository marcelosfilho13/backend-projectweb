import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/authenticateUserService.js"; 
import { CreateUserService } from "../services/createUserService.js";

export class AuthController {
    async login(req: Request, res:Response){
        const {email, password} = req.body;
        try {
            const authenticateUserService = new AuthenticateUserService()

            //* Chamar o serviço de Autenticação 
            const result = await authenticateUserService.execute({email, password});

            //* Retorna o token e os dados do usuário com status 200(ok)
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("🚨 Erro no login:", error.message);
            //* Captura o erro do Service e devolve 401 (Não Autorizado) para o Front-end
            return res.status(401).json({error: error.message})
        }
    }

    async register(req: Request, res: Response) {
        const {name, email, password, perfil} = req.body;

        try {
            const createuserService = new CreateUserService();

            const user = await createuserService.execute({
                name,
                email,
                password,
                perfil
            });

            //* Retorna o usuário criado com status 201 (Created)
            return res.status(201).json(user)
        } catch (error: any) {
            console.error("🚨 Erro no cadastro:", error.message);
            //* Retorna 400 (Bad Request) se o e-mail já existir ou se houver outro erro de validação
            return res.status(400).json({ error: error.message });
        }
    }
}