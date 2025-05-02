import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';
dotenv.config();
import type { PRChunk } from './chunker';

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const client = new ChromaClient({ path: CHROMA_URL });

export async function saveChunksToChroma(chunksWithEmbeddings: (PRChunk & { embedding: number[] })[]) {
  const collectionName = 'pr-chunks';
  const collection = await client.getOrCreateCollection({ name: collectionName });
  for (const chunk of chunksWithEmbeddings) {
    await collection.add({
      ids: [String(chunk.prId) + '-' + chunk.file + '-' + chunk.chunkIndex],
      embeddings: [chunk.embedding],
      documents: [chunk.chunk],
      metadatas: [{
        prId: chunk.prId,
        prTitle: chunk.prTitle,
        file: chunk.file,
        chunkIndex: chunk.chunkIndex,
      }],
    });
  }
}

export async function getAllChunksFromChroma() {
  const collectionName = 'pr-chunks';
  const collection = await client.getOrCreateCollection({ name: collectionName });
  const data = await collection.get();
  return data; // ids, documents, embeddings, metadatas 배열 포함
} 