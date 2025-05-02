import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();
import { getEmbedding } from "./embedding";
import { ChromaClient, IncludeEnum } from "chromadb";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const client = new ChromaClient({ path: CHROMA_URL });

export async function ragQuery(
  question: string,
  nResults = 5
): Promise<string> {
  // 1. 질문 임베딩
  const questionEmbedding = await getEmbedding(question);

  // 2. Chroma에서 유사 chunk 검색
  const collection = await client.getOrCreateCollection({ name: "pr-chunks" });
  const searchResult = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults,
    include: [IncludeEnum.Documents, IncludeEnum.Metadatas],
  });
  const contextChunks = searchResult.documents[0] as string[];
  const contextMetadatas = searchResult.metadatas[0] as any[];

  // 3. GPT-4o-mini에 context와 함께 질의
  const contextText = contextChunks
    .map((chunk, i) => {
      const meta =
        contextMetadatas && contextMetadatas[i] ? contextMetadatas[i] : {};
      return `[${i + 1}] 파일: ${meta.file ?? ""}, PR: ${
        meta.prId ?? ""
      }, chunk: ${meta.chunkIndex ?? ""}\n${chunk}`;
    })
    .join("\n\n---\n\n");

  const systemPrompt = `\
    너는 강의를 준비하는 개발자를 위한 코드 패턴 탐색 도우미야.
    아래 [질문]에 해당하는 코드 패턴이 누구의 PR, 어떤 파일, 어떤 코드로 등장하는지 구체적으로 알려줘.
    참고 코드에 없는 패턴이면 모른다고 답변해.
    `;

  const prompt = `\
    [질문]
    ${question}
    
    아래 [참고 코드/설명]을 참고해서 위 질문에 답변해 주세요.
    
    [참고 코드/설명]
    ${contextText}
    
    [답변]
    `;
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: 512,
  });
  return chat.choices[0].message.content || "";
}

// CLI 테스트용
if (require.main === module) {
  (async () => {
    const question = process.argv.slice(2).join(" ");
    if (!question) {
      console.log("질문을 입력하세요: node src/rag.js <질문>");
      process.exit(1);
    }
    const answer = await ragQuery(question);
    console.log("\n---\nGPT 답변:\n", answer);
  })();
}
