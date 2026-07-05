import { Pool } from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Carrega o arquivo .env
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });

async function main() {
  console.log("🌱 Starting database seeding process via Raw SQL...");

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "🚨 Erro: A variável DATABASE_URL não foi encontrada no ambiente!",
    );
  }

  console.log("🔐 Criptografando senha de teste...");
  const hashedPassword = await bcrypt.hash("Sade@123", 10);

  // 1. Inserir ou Atualizar ADMIN
  console.log("👥 Criando/Verificando usuário ADMIN...");
  await pool.query(
    `
    INSERT INTO users (name, email, password, perfil, status, created_at)
    VALUES ('Marilia Martins', 'teste01@teste.com', $1, 'Administrador', 'ATIVO', NOW())
    ON CONFLICT (email) DO UPDATE 
    SET name = EXCLUDED.name, password = EXCLUDED.password, perfil = EXCLUDED.perfil, status = 'ATIVO';
  `,
    [hashedPassword],
  );
  console.log("👤 User [Administrador] pronto e ATIVO: teste01@teste.com");

  // 2. Inserir ou Atualizar PEDAGOGICO
  console.log("👥 Criando/Verificando usuário PEDAGOGICO...");
  await pool.query(
    `
    INSERT INTO users (name, email, password, perfil, status, created_at)
    VALUES ('Marcelo Saldanha', 'teste02@teste.com', $1, 'Setor Pedagógico', 'ATIVO', NOW())
    ON CONFLICT (email) DO UPDATE 
    SET name = EXCLUDED.name, password = EXCLUDED.password, perfil = EXCLUDED.perfil, status = 'ATIVO';
  `,
    [hashedPassword],
  );
  console.log("👤 User [Setor Pedagógico] pronto e ATIVO: teste02@teste.com");

  // 3. Inserir ou Atualizar SERVIDOR
  console.log("👥 Criando/Verificando usuário SERVIDOR...");
  await pool.query(
    `
    INSERT INTO users (name, email, password, perfil, status, created_at)
    VALUES ('João Gomes', 'teste03@teste.com', $1, 'Servidor', 'ATIVO', NOW())
    ON CONFLICT (email) DO UPDATE 
    SET name = EXCLUDED.name, password = EXCLUDED.password, perfil = EXCLUDED.perfil, status = 'ATIVO';
  `,
    [hashedPassword],
  );
  console.log("👤 User [Servidor] pronto e ATIVO: teste03@teste.com");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    console.log("✅ Database seeding process completed.");
  });
