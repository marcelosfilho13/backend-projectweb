import "dotenv/config"; 
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
