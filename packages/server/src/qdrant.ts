import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Document } from 'langchain/document';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'nsbu-documents';

export const qdrant = new QdrantClient({
  url: 'https://<ТВОЙ-КЛАСТЕР>.qdrant.tech', // замените на адрес вашего кластера
  apiKey: '<API-КЛЮЧ>' // замените на ваш Qdrant API-ключ
});

export const initCollection = async () => {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.find(c => c.name === COLLECTION_NAME);
  if (!exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 1536,
        distance: 'Cosine',
      },
    });
  }
};

export const uploadChunks = async (texts: string[], metadata?: Record<string, any>) => {
  const embeddings = new OpenAIEmbeddings();
  const docs = texts.map(text => new Document({ pageContent: text, metadata }));
  const vectors = await embeddings.embedDocuments(docs.map(doc => doc.pageContent));

  await qdrant.upsert(COLLECTION_NAME, {
    points: vectors.map((vector, i) => ({
      id: uuidv4(),
      vector,
      payload: {
        text: docs[i].pageContent,
        ...(docs[i].metadata || {})
      }
    }))
  });
};