import {Request, Response} from "express";
import {CreateUserService} from "../services/createUserService"
import {AuthenticateUserService} from "../services/authenticateUserService"


export class UserController {
    public async register(req: Request, res: Response) {
        const { name, email, password, perfil } = req.body;
        const createUserService = new CreateUserService();
        try {
            const user = await createUserService.execute({ name, email, password, perfil });
            return res.status(201).json(user);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    public async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const authenticateUserService = new AuthenticateUserService();

    try {
        const result = await (authenticateUserService.execute as any)({ email, password,});
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(401).json({ error: error.message });
    }
    }
}