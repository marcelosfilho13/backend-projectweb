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

    try{
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret);

        console.log(`🔒 [SERVER LOG]: Usuário ID ${decoded.sub} autenticado com sucesso via JWT!`);
        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido" });
    }
}