import {Request, Response} from "express";
import {OccurrenceService} from "../services/occurrence";

const occurrenceService = new OccurrenceService();

export class OccurrenceController {
    async create(req: Request, res: Response) {
        try {
            const { type, gravity, description, students_Id, users_Id } = req.body;

            //! Captura o ID do utilizador autenticado (injetado via JWT no req.user)
            const userId = users_Id; //! Garantindo que o ID do usuário autenticado seja usado

            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            //* Validação básica de payload antes de tocar o serviço
            if (!type || !gravity || !description || !students_Id) {
                return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
            }

            const occurrence = await occurrenceService.create({
                type,
                gravity,
                description,
                students_Id,
                users_Id: userId, // * Garantindo que o ID do usuário autenticado seja usado
            });

            return res.status(201).json({
                message: "Ocorrência criada com sucesso.",
                data: occurrence,
            });
        } catch (error: any) {
            console.error("🚨 Error in OccurrenceController.create:", error);

            if(error.message === "Estudante não encontrado.") {
                return res.status(404).json({ error: "Estudante não encontrado." });
            }

            return res.status(500).json({ error: "Erro ao criar ocorrência." });
        }
    }
}

