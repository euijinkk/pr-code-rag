import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  if (!response.data || !response.data[0] || !response.data[0].embedding) {
    throw new Error("OpenAI embedding API error: " + JSON.stringify(response));
  }
  return response.data[0].embedding;
}
