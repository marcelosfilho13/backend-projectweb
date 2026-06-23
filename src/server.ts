import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.json('Rota inicial');
    res.send('Hello, World!');
});

app.get('/users', (req, res) => {
    res.json('Rota de usuários');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});