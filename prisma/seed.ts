import {PrismaClient} from "../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding process...");

  // Garante que a URL do banco está visível para o processo
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "🚨 Erro: A variável DATABASE_URL não foi encontrada no ambiente!",
    );
  }

  console.log("🔐 Criptografando senha de teste...");
  // * Criptografar senha padrão de teste para o usuário admin
  const hashedPassword = await bcrypt.hash("Sade@123", 10);

  console.log("👥 Verificando/Criando usuário ADMIN...");
  const adminUser = await prisma.user.upsert({
    where: { email: "teste01@teste.com" },
    update: {},
    create: {
      name: "Marilia Martins",
      email: "teste01@teste.com",
      password: hashedPassword,
      perfil: "Administrador",
    },
  });

  console.log(
    `👤 User [${adminUser.perfil}] checked/created: ${adminUser.email}`,
  );

  console.log(`✅ Usuário PATIO pronto: ${adminUser.email}`);

  console.log("👥 Verificando/Criando usuário PEDAGOGICO...");

  const pedagogicalUser = await prisma.user.upsert({
    where: { email: "teste02@teste.com" },
    update: {},
    create: {
      name: "Marcelo Saldanha",
      email: "teste02@teste.com",
      password: hashedPassword,
      perfil: "Setor Pedagógico",
    },
  });

  console.log(
    `👤 User [${pedagogicalUser.perfil}] checked/created: ${pedagogicalUser.email}`,
  );

  const serverUser = await prisma.user.upsert({
    where: { email: "teste03@teste.com" },
    update: {},
    create: {
      name: "João Gomes",
      email: "teste03@teste.com",
      password: hashedPassword,
      perfil: "Servidor",
    },
  });

  console.log(
    `👤 User [${serverUser.perfil}] checked/created: ${serverUser.email}`,
  );
}

main()
    .catch((e) => {
        console.error("❌ Error during database seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("✅ Database seeding process completed.");
    });