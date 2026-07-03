import express from "express";
import cors from "cors";
import { appRoutes } from "./routes";

const app = express();


app.use(cors()); //* Permite que qualquer aplicação acesse a API
app.use(express.json()); //* Permite que o Express entenda requisições com corpo em JSON

app.use("/api/v1", appRoutes); //* Vincula as rotas criadas ao servidor Express

app.get("/healthcheck", (req, res) => {
  return res.status(200).json({ message: "Servidor backend está funcionando corretamente!" });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend inicializado com sucesso!`);
  console.log(`📡 Escutando requisições na URL: http://localhost:${PORT}`);
});