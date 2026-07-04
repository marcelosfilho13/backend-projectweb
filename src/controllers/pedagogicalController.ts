import {Request, Response} from "express";
import {PedagogicalGuidanceService} from "../services/pedagogical";

const pedagogicalGuidanceService = new PedagogicalGuidanceService();

export class PedagogicalController {
    //* GET /api/v1/pedagogical/attention
    async getQueue(req: Request, res: Response) {
        try {
            const queue = await pedagogicalGuidanceService.getAttentionQueue();
            return res.status(200).json(queue);
        } catch (error) {
            console.error("🚨 Error in PedagogicalController.getQueue:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    //* POST /api/v1/pedagogical/fowarding
    async storeForwarding(req: Request, res: Response) {
        try {
            const { students_Id, description } = req.body;
            const users_Id = req.user?.id; //! Garantindo que o ID do usuário autenticado seja usado

            if (!users_Id) {
                return res.status(401).json({ error: "Sessão inválida ou utilizador não identificado." });
            }

            if (!students_Id || !description) {
                return res.status(400).json({ error: "Todos os campos do encaminhamento são obrigatórios." });
            }

            const forwarding = await pedagogicalGuidanceService.create({
                description,
                registrationDate: new Date(),
                students_Id,
                users_Id,
            });

            return res.status(201).json({
                message: "Encaminhamento pedagógico registrado com sucesso",
                data: forwarding
            });
        } catch(error: any) {
            console.error("🚨 Error in PedagogicalController.storeForwarding:", error);

            if (error.message === "Estudante não encontrado") {
                return res.status(404).json({ error: "O estudante alvo deste encaminhamento não foi localizado." });
            } 

            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}