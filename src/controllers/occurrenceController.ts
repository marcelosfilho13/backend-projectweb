    import { Request, Response } from "express";
    import { OccurrenceService } from "../services/occurrence";
    import { prisma } from "../database/prismaClient";

    const occurrenceService = new OccurrenceService();

    export class OccurrenceController {
      //* RF05 — Criar Registro de Ocorrência (Exclusivo Administrador)
      async create(req: Request, res: Response) {
        try {
          //* Extraímos as variáveis do corpo da requisição.
          const {
            type,
            gravity,
            description,
            measuresTaken,
            providencias,
            students_Id,
          } = req.body;

          //* RN02: Garante a extração automática do ID do administrador logado via JWT (com bypass de tipo para produção)
          const userId = (req as any).userId || (req as any).user?.id;

          if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
          }

          // Validação básica de campos obrigatórios
          if (!type || !gravity || !description || !students_Id) {
            return res.status(400).json({
              error: "Todos os campos obrigatórios devem ser preenchidos.",
            });
          }

          const occurrence = await occurrenceService.create({
            type,
            gravity,
            description,
            measuresTaken:
              measuresTaken ||
              providencias ||
              "Nenhuma providência registrada inicialmente.",
            students_Id: Number(students_Id),
            users_Id: Number(userId), //* RN02: Vinculado de forma automatizada e segura
          });

          return res.status(201).json({
            message: "Ocorrência criada com sucesso.",
            data: occurrence,
          });
        } catch (error: any) {
          console.error("🚨 Error in OccurrenceController.create:", error);

          if (error.message === "Estudante não encontrado.") {
            return res.status(404).json({ error: "Estudante não encontrado." });
          }

          return res.status(500).json({ error: "Erro ao criar ocorrência." });
        }
      }

      //* Tela 4 — Listar todas as ocorrências cadastradas (Todos os perfis acessam)
      async listAll(req: Request, res: Response) {
        try {
          //* Pega os parâmetros opcionais de query string da tabela (ex: ?status=ABERTO&search=João)
          const { status, search } = req.query;

          const occurrences = await occurrenceService.listAll({
            status: status ? String(status) : undefined,
            search: search ? String(search) : undefined,
          });

          return res.status(200).json(occurrences);
        } catch (error) {
          console.error("🚨 Error in OccurrenceController.listAll:", error);
          return res
            .status(500)
            .json({ error: "Erro ao buscar a listagem de ocorrências." });
        }
      }

      //* RN03 — Excluir ocorrência (Exclusivo Administrador)
      async delete(id: number): Promise<void> {
        // 1. Verifica se a ocorrência existe antes de deletar
        const occurrenceExists = await prisma.occurrence.findUnique({
          where: { id },
        });

        if (!occurrenceExists) {
          throw new Error("Ocorrência não encontrada.");
        }

        // 2. Realiza a deleção física ou lógica no banco de dados
        await prisma.occurrence.delete({
          where: { id },
        });
      }
}
