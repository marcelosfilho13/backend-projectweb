import { prisma } from "../database/prismaClient";

interface CreateFollowUpDTO {
    description: string;
    occurrences_Id: number; 
    users_Id: number; //* Identifica quem registrou o acompanhamento
}

export class PedagogicalGuidanceService {
  //* RF07 — Obter Detalhes do Painel de Acompanhamento de uma Ocorrência Específica
    async getOccurrenceDetailsForPanel(occurrenceId: number) {
    const occurrence = await prisma.occurrence.findUnique({
            where: { id: occurrenceId },
            include: {
            students: {
                select: {
                id: true,
                name: true,
                registration: true,
                course: { select: { name: true } },
                class: { select: { name: true } },
                },
            },
            user: { select: { name: true } }, //* Quem registrou a ocorrência originalmente
            //* Traz o histórico completo de acompanhamentos já registrados para essa ocorrência específica
            educationalGuidance: {
                orderBy: { id: "asc" }, //* Histórico em ordem cronológica
                include: {
                user: { select: { name: true, profile: true } }, //* Quem fez o acompanhamento
                },
            },
            },
    });

    if (!occurrence) {
        throw new Error("Ocorrência não encontrada.");
    }

    return occurrence;
    }

  //* RF07 — Registrar Acompanhamento em Texto Livre e/ou Atualizar Status
    async addFollowUp(data: CreateFollowUpDTO, newStatus?: string) {
    //* Verificar se a ocorrência existe
        const occurrenceExists = await prisma.occurrence.findUnique({
            where: { id: data.occurrences_Id },
        });

        if (!occurrenceExists) {
            throw new Error("Ocorrência não encontrada.");
        }

        //* Transação do Prisma para salvar o texto e atualizar o status da ocorrência simultaneamente
        return await prisma.$transaction(async (tx) => {
        //* Identifica o nome correto do modelo/tabela no Prisma de forma segura
            const guidanceModel = ('educationalGuidance' in tx) 
            ? (tx as any).educationalGuidance 
            : (tx as any).educationalGuidances || (tx as any).pedagogicalGuidance;

            if (!guidanceModel) {
            throw new Error("Tabela de acompanhamento pedagógico não encontrada no Prisma Client.");
            }

            //* RF08 - Cria o registro de texto livre no histórico usando o modelo mapeado dinamicamente
            const followUp = await guidanceModel.create({
              data: {
                description: data.description, //* O texto livre: "convocação dos responsáveis", "orientação disciplinar"...
                registrationDate: new Date(), //* Data automática do registro
                occurrences_Id: data.occurrences_Id, //* REQUISITO OBRIGATÓRIO: Aponta para a ocorrência específica
                students_Id: occurrenceExists.students_Id, //* Vincula ao aluno dono da ocorrência automaticamente
                users_Id: data.users_Id, //* Identifica quem registrou (Pedagógico ou Admin logado)
              },
              include: { user: { select: { name: true } } }, //* Já traz o nome do autor do registro para o histórico da tela
            });
            
            if (newStatus) {
            const occurrenceModel =
                "occurrence" in tx ? (tx as any).occurrence : (tx as any).occurrences; // Fallback caso esteja no plural no seu schema

            if (occurrenceModel) {
                await occurrenceModel.update({
                where: { id: data.occurrences_Id },
                data: { status: newStatus },
                });
            }
            }

            return followUp;
        });
    }

  //* RF07 — Tomar Ciência da Ocorrência (Ação exclusiva do Setor Pedagógico)
    async takeAcknowledge(occurrenceId: number, userId: number) {
        const occurrence = await prisma.occurrence.findUnique({
            where: { id: occurrenceId },
        });
        if (!occurrence) throw new Error("Ocorrência não encontrada.");

        //* Cria uma mensagem automática no histórico registrando a ciência pedagógica
        return await this.addFollowUp(
            {
            occurrences_Id: occurrenceId,
            users_Id: userId,
            description: "Equipe Pedagógica tomou ciência desta ocorrência.",
            },
            "EM_ANALISE",
        ); //* já move o status automaticamente para Em Análise
    }
}