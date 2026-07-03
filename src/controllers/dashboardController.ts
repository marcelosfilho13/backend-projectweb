import {Request, Response} from "express";
import {DashboardService} from "../services/dashboard";

const dashboardService = new DashboardService();

export class DashboardController {
    async getStats(req: Request, res: Response) {
        try {
            const { courses_Id, class_Id } = req.query;
            const filters = {
                courses_Id: courses_Id ? Number(courses_Id) : undefined,
                class_Id: class_Id ? Number(class_Id) : undefined
            };
            const stats = await dashboardService.getStats(filters);
            res.json(stats);
        } catch (error) {
            res.status(500).json({
                error: "Internal Server Error",
                message: "Ocorreu um erro ao processar os indicadores do dashboard."
            });
        }
    }
}