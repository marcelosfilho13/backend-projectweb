declare namespace Express {
    export interface Request {
    user?: {
        id: number; // ✨ Tipo alterado de string para number
        perfil: string;
    };
    }
}