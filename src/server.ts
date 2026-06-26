import express from "express";
import cors from "cors";
import { routes } from "./routes";

const app = express();

//* Middlerares globais
app.use(cors());
app.use(express.json()); //* Permite que o Express entenda requisições com corpo em JSON */

//* Vicunle as rotas criadas ao servidor Express
app.use(routes);

//* Rota protegida: Só entra quem tem o Token JWT válido
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend inicializado com sucesso!`);
  console.log(`📡 Escutando requisições na URL: http://localhost:${PORT}`);
});
