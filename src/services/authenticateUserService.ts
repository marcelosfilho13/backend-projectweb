import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prismaClient";

interface IRequest {
  email: string;
  password: string;
}

export class AuthenticateUserService {
    public async execute({ email, password }: IRequest) {
        //* Verifica se o usuário existe no banco de dados.
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            throw new Error("Usuário ou senha incorretos.");
        }

        //* Comparar senha enviada com senha criptografada no banco de dados.
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            throw new Error("Usuário ou senha incorretos.");
        }

        const secret = process.env.JWT_SECRET
        const token = jwt.sign(
            {perfil: user.perfil},
            secret,
            {
                subject: user.id,
                expiresIn: "1d",
            }
        );

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        };
    }
}
