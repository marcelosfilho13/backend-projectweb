import {Request, Response} from "express";
import {prisma} from "../database/prismaClient"

export class AdminController {
  //* Listar todas as solicitações pendentes
  async listPending(req: Request, res: Response) {
    try {
      const pendingUsers = await (prisma.user.findMany as any)({
        where: {
          status: "PENDENTE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          perfil: true,
          dataCreated: true,
        },
      });

      return res.status(200).json(pendingUsers);
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: "Erro ao listar usuários pendentes." });
    }
  }

  //* Aprovar a conta do usuário (Mudando status para ATIVO)
  async approve(req: Request, res: Response) {
    const { id } = req.params; //* Recebe o ID do usuário via URL (Ex: /admin/approve/5)
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      const updateUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          status: "ATIVO",
        },
      });

      return res.status(200).json({
        message: `Usuário ${updateUser.name} aprovado com sucesso como ${updateUser.perfil}!`,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao aprovar usuário." });
    }
  }

    //* Recusar a conta do usuário (Mudando status para RECUSADO)
    async reject(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const user = await prisma.user.findUnique({
                where: { id: Number(id) },
            });

            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado." });
            }

            const updatedUser = await (prisma.user.update as any)({
                where: { id: Number(id) },
                data: {
                status: "RECUSADO",
                },
            });

            return res.status(200).json({
                message: `Solicitação de acesso do usuário ${updatedUser.name} foi recusada.`,
            });
        } catch (error: any) {
            return res.status(500).json({ error: "Erro ao recusar usuário." });
        }
    }
}