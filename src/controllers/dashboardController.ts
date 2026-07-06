import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.js";

const dashboardService = new DashboardService();

export class DashboardController {
async getStats(req: Request, res: Response) {
    try {
      const { courses_Id, class_Id } = req.query;

      //* Recupera o perfil do usuário logado injetado pelo seu middleware de autenticação.
      //* Se o seu middleware salvar dentro de 'user', usamos req.user?.perfil como alternativa.
      const userPerfil =
        (req as any).userPerfil || (req as any).user?.perfil || "Servidor";

      const filters = {
        courses_Id: courses_Id ? Number(courses_Id) : undefined,
        class_Id: class_Id ? Number(class_Id) : undefined,
      };

      //* Passa os filtros e o perfil do usuário para o service decidir o que retornar
      const stats = await dashboardService.getStats(filters, userPerfil);

      return res.json(stats);
    } catch (error) {
        // 🟢 Adicione esta linha para o terminal nos dizer o que quebrou:
        console.error("❌ ERRO REAL DO DASHBOARD:", error);

        return res.status(500).json({
        error: "Internal Server Error",
        message: "Ocorreu um erro ao processar os indicadores do dashboard.",
        });
      /*
        return res.status(500).json({
        error: "Internal Server Error",
        message: "Ocorreu um erro ao processar os indicadores do dashboard.",
        });
        */
    }
}
}
