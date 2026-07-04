import { prisma } from "../database/prismaClient";

interface CreatePedagogicalGuidanceDTO {
  description: string;
  registrationDate: string | Date; // Permite receber a string do front e tratar ou salvar direto
  students_Id: number;
  users_Id: number;
}

export class PedagogicalGuidanceService {
  //* 1. Filtrar e listar a fila de alunos em risco (Atenção / Encaminhamento / Alertas Graves)
  async getAttentionQueue() {
    const studentsInAttention = await prisma.student.findMany({
      include: {
        course: { select: { name: true } },
        class: { select: { name: true } },
        occurrences: {
          select: {
            id: true,
            type: true,
            gravity: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    const attentionQueue = studentsInAttention
      .map((student) => {
        const totalOccurrences = student.occurrences.length;

        const hasSevereAlert = student.occurrences.some(
          (occurrence) => occurrence.gravity.toLowerCase() === "grave",
        );
        let status: "Normal" | "Atenção" | "Encaminhamento Pedagógico" =
          "Normal";

        if (totalOccurrences >= 3 && totalOccurrences <= 4) {
          status = "Atenção"; // * RN04: Nível de atenção
        }

        if (totalOccurrences >= 5) {
          status = "Encaminhamento Pedagógico"; // * RN04: Encaminhamento pedagógico
        }

        return {
          id: student.id,
          name: student.name,
          course: student.course,
          class: student.class.name,
          totalOccurrencer: totalOccurrences,
          status,
          hasSevereAlert,
        };
      })
      .filter(
        (student) => student.status !== "Normal" || student.hasSevereAlert,
      );

    return attentionQueue;
  }

  //* 2. Criar um registro de orientação pedagógica para um estudante específico
  async create(data: CreatePedagogicalGuidanceDTO) {
    const studentExists = await prisma.student.findUnique({
      where: { id: data.students_Id },
    });

    if (!studentExists) {
      throw new Error("Estudante não encontrado.");
    }

    return await prisma.educationalGuidance.create({
      data: {
        description: data.description,
        registrationDate: data.registrationDate,
        students_Id: data.students_Id,
        users_Id: data.users_Id,
      },
    });
  }
}
