console.log("teste de entrada");
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";


const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

/*
console.log("teste de entrada")
import { PrismaClient } from "../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Certifique-se de que a variável de ambiente está carregada
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL não está configurada no arquivo .env");
}

// Cria o pool de conexões do driver nativo 'pg'
const pool = new Pool({ connectionString });

// Instancia o adaptador oficial do Prisma para o PostgreSQL
const adapter = new PrismaPg(pool);

// Injeta o adaptador nas opções do PrismaClient (obrigatório no Prisma 7+)
export const prisma = new PrismaClient({ adapter });

/*
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";
import { Pool } from "pg";

// Resgate a URL do processo
const connectionString = process.env.DATABASE_URL;

// Defesa Preventiva: Se a string estiver vazia, avisa no console antes de quebrar
if (!connectionString) {
    console.error(
        "🚨 ERRO: A variável DATABASE_URL não foi encontrada no arquivo .env!",
    );
}

// Inicializa o Pool de conexões do PG
const pool = new Pool({
    connectionString: connectionString || "postgresql://invalid_fallback",
});

const adapter = new PrismaPg(pool);

// Instancia o Prisma passando o adaptador pronto
export const prisma = new PrismaClient({ adapter });
*/
