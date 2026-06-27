import bcrypt from "bcrypt";
import { prisma } from "../database/prismaClient";

interface IRequest {
  name: string;
  email: string;
  password: string;
  perfil: string;
}

export class CreateUserService {
    public async execute({ name, email, password, perfil }: IRequest) {
        //* verifica se o e-mail já está cadastrado no banco de dados.
        const userAlreadyExists = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (userAlreadyExists) {
            throw new Error("Este e-mail já está cadastrado.");
        }

        //* Criptografar a senha do usuário antes de armazená-la no banco de dados.
        const hashedPassword = await bcrypt.hash(password, 10);

        // * Salvar no banco de dados o usuário com a senha criptografada.
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                perfil,
            },
        });

        //*  Por segurança, a senha não deve ser retornada na resposta.
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

