import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import path from 'path';
import { initCollection, uploadChunks } from './qdrant';
import { askQuestion } from './ask';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../ui/dist')));

const upload = multer({ dest: 'uploads/' });

initCollection().then(() => {
  console.log('✅ Qdrant collection initialized');
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const buffer = fs.readFileSync(req.file.path);
    const pdf = await pdfParse(buffer);
    const text = pdf.text;
    const chunks = splitIntoChunks(text, 500);

    await uploadChunks(chunks, { source: req.file.originalname });
    res.json({ status: 'ok', chunksUploaded: chunks.length });
  } catch (err) {
    console.error('PDF upload error:', err);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const result = await askQuestion(question);
    res.json(result);
  } catch (err) {
    console.error('Ask error:', err);
    res.status(500).json({ error: 'Failed to get answer from GPT' });
  }
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../ui/dist/index.html'));
});

app.listen(port, () => {
  console.log(`✅ Flowise NSBU API is running at http://localhost:${port}`);
});

function splitIntoChunks(text: string, maxLength: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current += ' ' + sentence;
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}
