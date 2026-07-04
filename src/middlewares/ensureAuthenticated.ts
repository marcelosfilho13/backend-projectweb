import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    const parts = authHeader.split(" ");
    if(parts.length !== 2) {
        return res.status(401).json({ error: "Token inválido" });
    }

    const [scheme, token] = parts;

    if(!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: "Token mal formatado" });
    }

    try {
        const secret = process.env.JWT_SECRET as string;

        //* Mapeamos os tipos esperados do payload do token decodificado
        const decoded = jwt.verify(token, secret) as { id: number; perfil: string };

        //* Injetamos com sucesso o id como número real no objeto 'req'
        req.user = {
            id: Number(decoded.id), // Garante que seja lido como número
            perfil: decoded.perfil,
        };

        console.log(
            `🔒 [SERVER LOG]: Usuário ID ${decoded.id} (${decoded.perfil}) autenticado com sucesso!`,
        );

        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}