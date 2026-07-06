import { Request, Response } from "express";
import { PedagogicalGuidanceService } from "../services/pedagogical.js";

const pedagogicalGuidanceService = new PedagogicalGuidanceService();

export class PedagogicalController {
  //* Tela 5 — Carrega todos os dados do Painel ao abrir uma ocorrência específica
    async getPanelDetails(req: Request, res: Response) {
        try {
            const { occurrenceId } = req.params;

            if (!occurrenceId) {
            return res
                .status(400)
                .json({ error: "O ID da ocorrência é obrigatório." });
            }

            const panelDetails =
            await pedagogicalGuidanceService.getOccurrenceDetailsForPanel(
                Number(occurrenceId),
            );

            return res.status(200).json(panelDetails);
        } catch (error: any) {
            console.error(
            "🚨 Error in PedagogicalController.getPanelDetails:",
            error,
            );
            if (error.message === "Ocorrência não encontrada.") {
            return res.status(404).json({ error: error.message });
            }
            return res
            .status(500)
            .json({ error: "Erro ao carregar o painel de acompanhamento." });
        }
    }

  //* Tela 5 — Registrar acompanhamento em texto livre e atualizar status (Pedagógico e Admin)
    async storeFollowUp(req: Request, res: Response) {
        try {
            const { occurrenceId } = req.params;
            const { description, status } = req.body; //* status opcional enviado pelo combo/select da tela

            const userId = (req as any).userId || req.user?.id;

            if (!userId) {
            return res
                .status(401)
                .json({ error: "Sessão inválida ou utilizador não identificado." });
            }

            if (!description) {
            return res
                .status(400)
                .json({
                    error: "O texto de descrição do acompanhamento é obrigatório.",
                });
            }

            const followUp = await pedagogicalGuidanceService.addFollowUp(
            {
                description,
                occurrences_Id: Number(occurrenceId),
                users_Id: Number(userId),
            },
            status ? String(status) : undefined,
            );

            return res.status(201).json({
                message: "Acompanhamento registrado com sucesso.",
                data: followUp,
            });
        } catch (error: any) {
            console.error("🚨 Error in PedagogicalController.storeFollowUp:", error);
            if (error.message === "Ocorrência não encontrada.") {
                return res.status(404).json({ error: error.message });
            }
            return res
            .status(500)
            .json({ error: "Erro ao registrar o acompanhamento." });
        }
    }

    //* Tela 5 — Ação rápida de "Tomar Ciência" (Apenas Setor Pedagógico)
    async acknowledge(req: Request, res: Response) {
        try {
            const { occurrenceId } = req.params;
            const userId = (req as any).userId || req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const acknowledgment = await pedagogicalGuidanceService.takeAcknowledge(
            Number(occurrenceId),
            Number(userId),
            );

            return res.status(200).json({
                message: "Ciência registrada com sucesso no histórico da ocorrência.",
                data: acknowledgment,
            });
        } catch (error: any) {
            console.error("🚨 Error in PedagogicalController.acknowledge:", error);
            if (error.message === "Ocorrência não encontrada.") {
                return res.status(404).json({ error: error.message });
            }
            return res
            .status(500)
            .json({ error: "Erro ao registrar tomada de ciência." });
        }
    }
}