import { fetchPullRequests } from "../github/fetchPRs";
import { chunkPRs } from "./chunker";
import { getEmbedding } from "./embedding";
import { saveChunksToChroma } from "./chroma";
import { loadEmbeddingCache, saveEmbeddingCache } from "./embeddingCache";
import fs from "fs";
import path from "path";

async function main() {
  // TODO: 실제 저장소 owner/repo로 교체하세요
  const prs = await fetchPullRequests("woowacourse", "react-payments", 1);

  // PR 전체 내용을 파일로 저장
  const prsPath = path.resolve(__dirname, "pr-response.json");
  fs.writeFileSync(prsPath, JSON.stringify(prs, null, 2), "utf-8");
  console.log(`✅ PR 전체 내용이 ${prsPath} 파일에 저장되었습니다.`);

  const chunks = chunkPRs(prs);

  const cache = loadEmbeddingCache();
  const chunksWithEmbeddings = [];
  let cacheUpdated = false;

  for (const chunk of chunks) {
    const id = String(chunk.prId) + "-" + chunk.file + "-" + chunk.chunkIndex;
    if (cache[id]) {
      // 캐시된 임베딩 사용
      chunksWithEmbeddings.push({ ...chunk, embedding: cache[id] });
    } else {
      // 새로 임베딩
      const embedding = await getEmbedding(chunk.chunk);
      chunksWithEmbeddings.push({ ...chunk, embedding });
      cache[id] = embedding;
      cacheUpdated = true;
    }
  }

  if (cacheUpdated) saveEmbeddingCache(cache);

  await saveChunksToChroma(chunksWithEmbeddings);
  console.log("✅ 모든 PR chunk가 Chroma에 저장되었습니다. (임베딩 캐시 사용)");
}

main();
