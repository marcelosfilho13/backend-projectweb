import { Request, Response, NextFunction } from "express";

// Definimos uma interface local clara para o Usuário Autenticado
interface AuthenticatedUser {
    id: number;
    email: string;
    perfil: "Administrador" | "Setor Pedagógico" | "Servidor";
}

/**
 * Middleware de Controle de Acesso Baseado em Funções (RBAC)
 * @param allowedRoles Array contendo a lista de perfis permitidos para acessar o endpoint
 */

export function checkRole(
    allowedRoles: ("Administrador" | "Setor Pedagógico" | "Servidor")[],
    ) {
        return (req: Request, res: Response, next: NextFunction) => {
        // Ignoramos o conflito global extraindo o user com a tipagem correta local via 'as any'
        const user = (req as any).user as AuthenticatedUser | undefined;

        //* 1. Defesa Preventiva: Valida se o middleware de autenticação (JWT) rodou antes deste
        if (!user) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "É necessário estar autenticado para acessar este recurso.",
            });
        }

        //* 2. Validação de Privilégio: Verifica se o perfil do usuário logado está na lista dos autorizados
        // Usamos 'as any' no método includes para blindar contra qualquer string externa
        if (!allowedRoles.includes(user.perfil as any)) {
            return res.status(403).json({
                error: "Forbidden",
                message: `Acesso negado. Seu perfil (${user.perfil}) não tem permissão para realizar esta ação.`,
            });
        }

        // 3. Sucesso: O perfil é compatível, libera o fluxo para o próximo Controller/Middleware
        return next();
        };
}
