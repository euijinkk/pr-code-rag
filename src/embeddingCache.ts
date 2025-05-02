import fs from 'fs';
import path from 'path';

const CACHE_PATH = path.resolve(__dirname, 'embedding_cache.json');

export function loadEmbeddingCache(): Record<string, number[]> {
  if (!fs.existsSync(CACHE_PATH)) return {};
  return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
}

export function saveEmbeddingCache(cache: Record<string, number[]>) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
} 