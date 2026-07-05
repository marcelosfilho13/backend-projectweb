import { prisma } from "../database/prismaClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    const dbUser = user as any;

    //* Comparar senha enviada com senha criptografada no banco de dados.
    const passwordMatch = await bcrypt.compare(password, dbUser.password);
    
    if (!passwordMatch) {
        throw new Error("Usuário ou senha incorretos.");
    }

    //* Validação dos Status de Moderação
    if (dbUser.status === "PENDENTE") {
        throw new Error("Sua solicitação de acesso está aguardando aprovação do administrador.");
    }

    if (dbUser.status === "RECUSADO") {
        throw new Error("Sua solicitação de acesso foi recusada.");
    }

    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(
        {
        id: dbUser.id, //* ID numérico no payload
        perfil: dbUser.perfil,
        },
        secret,
        {
        subject: String(dbUser.id),
        expiresIn: "1d",
        },
    );

    return {
        user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            status: dbUser.status,
        },
        token,
    };
    }
}
