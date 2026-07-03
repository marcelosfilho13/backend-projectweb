import {PrismaClient} from "../../generated/prisma";

const prisma = new PrismaClient();

interface CreateOccurrenceDTO {
    type: string;
    gravity: string;
    description: string;
    students_Id: number;
    users_Id: number;
}

export class OccurrenceService {
    async create(data: CreateOccurrenceDTO) {
      //* 1. Validar se o estudante existe
      const studentExists = await prisma.student.findUnique({
        where: { id: data.students_Id },
      });

      if (!studentExists) {
        throw new Error("Estudante não encontrado.");
      }

      //* 2. Aplicação Estrita da RN05 (Alerta de Gravidade Máxima)
      //* Se for GRAVE, ativamos o gatilho automático de urgência pedagógica

      const alertForPedagogicalAction = data.gravity.toLowerCase() === "grave".toUpperCase();

      //* 3. Persistência Defensiva no Banco de Dados

      return await prisma.occurrence.create({
        data: {
            type: data.type,
            gravity: data.gravity,
            description: data.description,
            students_Id: data.students_Id,
            users_Id: data.users_Id,
            //! Injetando flag de alerta pedagógico para ocorrências graves
            alertForPedagogicalAction: alertForPedagogicalAction, 
        }
      });
    }
}