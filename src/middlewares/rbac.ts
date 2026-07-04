import { Request, Response, NextFunction } from "express";

// 💡 Extensão de Escopo Global: Ensinamos o TypeScript a reconhecer o objeto 'user' dentro do Request do Express.
// Isso evita o uso de 'any' e previne erros de digitação durante o desenvolvimento.
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                perfil: "Administrador" | "Setor Pedagógico" | "Servidor"
            };
        }
    }
}

/**
 * Middleware de Controle de Acesso Baseado em Funções (RBAC)
 * @param allowedRoles Array contendo a lista de perfis permitidos para acessar o endpoint
 */

export function checkRole(allowedRoles: ("Administrador" | "Setor Pedagógico" | "Servidor")[]){
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

      //* 1. Defesa Preventiva: Valida se o middleware de autenticação (JWT) rodou antes deste
        if (!user) {
            return res.status(401).json({
            error: "Unauthorized",
            message: "É necessário estar autenticado para acessar este recurso.",
            });
        }

      //* 2. Validação de Privilégio: Verifica se o perfil do usuário logado está na lista dos autorizados
        if (!allowedRoles.includes(user.perfil)) {
            return res.status(403).json({
            error: "Forbidden",
            message: `Acesso negado. Seu perfil (${user.perfil}) não tem permissão para realizar esta ação.`,
            });
        }

        // 3. Sucesso: O perfil é compatível, libera o fluxo para o próximo Controller/Middleware
        return next();
    };
}