import { getAllChunksFromChroma } from "./chroma";
import { saveResultToFile } from "./saveResultToFile";

async function getDB() {
  const data = await getAllChunksFromChroma();
  saveResultToFile(data, "chroma_result.json");
}

getDB();
