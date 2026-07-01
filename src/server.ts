import express from "express";
import cors from "cors";
import { routes } from "./routes";
import { prisma } from "./database/prismaClient";

const app = express();

//* Middlerares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", //* Permite que qualquer aplicação acesse a API
}));
app.use(express.json()); //* Permite que o Express entenda requisições com corpo em JSON */

//* Vicunle as rotas criadas ao servidor Express
app.use(routes);

//* Rota protegida: Só entra quem tem o Token JWT válido
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend inicializado com sucesso!`);
  console.log(`📡 Escutando requisições na URL: http://localhost:${PORT}`);
});

//! Rota de Healthcheck para testar a saúde da API e do Banco na Nuvem
app.get("/healthcheck", async (req, res) => {
  try {
    // Indicamos ao TypeScript que o retorno esperado é um array genérico <unknown[]>
    await prisma.$queryRaw<unknown[]>`SELECT 1`;

    return res.status(200).json({
      status: "online",
      database: "connected",
      timestamp: new Date(),
      message: "SADE API e Banco no Render estão operacionais! 🚀",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      database: "disconnected",
      message: "A API está de pé, mas falhou ao conectar com o banco do Render.",
      error: error instanceof Error ? error.message : error
    });
  }
});