    import { prisma } from "../database/prismaClient";

    // Certifique-se de que a interface CreateFollowUpDTO esteja importada ou declarada aqui:
    interface CreateFollowUpDTO {
        occurrences_Id: number;
        users_Id: number;
        description: string;
    }

    export class PedagogicalGuidanceService {
        //* RF07 — Obter Detalhes do Painel de Acompanhamento de uma Ocorrência Específica
        //* RF07 — Obter Detalhes do Painel de Acompanhamento de uma Ocorrência Específica
        async getOccurrenceDetailsForPanel(occurrenceId: number) {
        const occurrence = await prisma.occurrence.findUnique({
            where: {
            id: Number(occurrenceId), // Usando a variável real recebida por parâmetro
            },
            include: {
            student: {
                select: {
                id: true,
                name: true,
                registration: true,
                class: {
                    select: {
                    name: true, // Nome da Turma
                    course: {
                        select: {
                        name: true, // Nome do Curso vindo de dentro da Turma
                        },
                    },
                    },
                },
                },
            },
            user: {
                select: {
                name: true,
                },
            },
            educationalGuidances: {
                orderBy: {
                id: "asc",
                },
                include: {
                user: {
                    select: {
                    name: true,
                    perfil: true,
                    },
                },
                },
            },
            },
        } as any);

        if (!occurrence) {
            throw new Error("Ocorrência não encontrada.");
        }

        return occurrence;
        }

        //* RF07 — Registrar Acompanhamento em Texto Livre e/ou Atualizar Status
        async addFollowUp(data: CreateFollowUpDTO, newStatus?: string) {
        const targetOccurrenceId =
            (data as any).occurrences_Id ||
            (data as any).occurrenceId ||
            (data as any).occurrence_id;

        // Validação preventiva antes de chamar o banco
        if (!targetOccurrenceId || isNaN(Number(targetOccurrenceId))) {
            throw new Error(
            "O campo occurrences_Id é obrigatório e deve ser um número válido.",
            );
        }

        //* Verificar se a ocorrência existe
        const occurrenceExists = await prisma.occurrence.findUnique({
            where: {
            id: Number(targetOccurrenceId), // 🟢 Agora garantimos que vai um Int válido para o Prisma!
            },
        } as any);

        if (!occurrenceExists) {
            throw new Error("Ocorrência não encontrada.");
        }
        if (!occurrenceExists) {
            throw new Error("Ocorrência não encontrada.");
        }

        //* Transação do Prisma para salvar o texto e atualizar o status da ocorrência simultaneamente
        return await prisma.$transaction(async (tx) => {
            //* Identifica o nome correto do modelo/tabela no Prisma de forma segura
            const guidanceModel =
            "educationalGuidance" in tx
                ? (tx as any).educationalGuidance
                : (tx as any).educationalGuidances ||
                (tx as any).pedagogicalGuidance;

            if (!guidanceModel) {
            throw new Error(
                "Tabela de acompanhamento pedagógico não encontrada no Prisma Client.",
            );
            }

            // 🟢 Captura o ID do estudante de forma segura independente do nome da coluna (plural/singular)
            const resolvedStudentId =
            (occurrenceExists as any).studentId ||
            (occurrenceExists as any).students_Id;

            //* RF08 - Cria o registro de texto livre no histórico usando o modelo mapeado dinamicamente
            const followUp = await guidanceModel.create({
                data: {
                    description: data.description, //* O texto livre
                    registrationDate: new Date(), //* Data automática do registro

                    // 🟢 CORREÇÃO: Passando apenas os campos exatos que o Prisma aceita
                    occurrenceId: Number(targetOccurrenceId),
                    studentId: Number(resolvedStudentId),
                    userId: Number(data.users_Id),
                },
                include: { user: { select: { name: true } } }, //* Já traz o nome do autor do registro
                } as any);

                if (newStatus) {
                const occurrenceModel =
                    "occurrence" in tx
                    ? (tx as any).occurrence
                    : (tx as any).occurrences; // Fallback caso esteja no plural no seu schema

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
        ); 
        }
}
