import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS и JSON
app.use(cors());
app.use(bodyParser.json());

// 📁 Путь к сборке UI
const uiPath = path.join(__dirname, '../../ui/dist');
app.use(express.static(uiPath));

// 🌐 Вернуть index.html на любой GET-запрос
app.get('*', (_, res) => {
  res.sendFile(path.join(uiPath, 'index.html'));
});

// 🚀 Запуск сервера
app.listen(port, () => {
  console.log(`✅ Flowise NSBU запущен: http://localhost:${port}`);
});
