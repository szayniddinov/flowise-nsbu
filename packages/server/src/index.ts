import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../ui/dist')));

const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);
    res.json({ text: pdfData.text });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error parsing PDF' });
  }
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../ui/dist/index.html'));
});

app.listen(port, () => {
  console.log(`✅ Flowise NSBU API is running at http://localhost:${port}`);
});
