import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import dotenv from 'dotenv';

// Загружаем .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настроим хранилище для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Создаём папку для загрузок, если её нет
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Загружаем PDF
app.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);

    // Пример того, как можно обработать содержимое PDF
    const pdfText = pdfData.text;

    // Удаляем файл после обработки
    fs.unlinkSync(req.file.path);

    return res.json({ text: pdfText });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return res.status(500).send('Failed to process the file.');
  }
});

// Запускаем сервер
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
