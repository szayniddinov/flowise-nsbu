import { QdrantVectorStore } from 'langchain/vectorstores/qdrant'
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { qdrant } from './qdrant'

const COLLECTION_NAME = 'nsbu-documents'

export const askQuestion = async (question: string) => {
  const embeddings = new OpenAIEmbeddings()

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    client: qdrant,
    collectionName: COLLECTION_NAME,
  })

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.2,
  })

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    returnSourceDocuments: true,
  })

  const response = await chain.call({ query: question })

  return {
    answer: response.text,
    sources: response.sourceDocuments?.map(d => d.metadata?.source || 'unknown'),
  }
}
