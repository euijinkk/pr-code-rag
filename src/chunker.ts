import type { PRDetail } from '../github/fetchPRs';
import { splitPatchIntoChunks } from './parser';

export interface PRChunk {
  prId: number;
  prTitle: string;
  file: string;
  chunk: string;
  chunkIndex: number;
}

export function chunkPRs(prs: PRDetail[]): PRChunk[] {
  const result: PRChunk[] = [];
  for (const pr of prs) {
    // PR title(설명)을 별도 chunk로 추가
    result.push({
      prId: pr.id,
      prTitle: pr.title,
      file: '__PR_DESCRIPTION__',
      chunk: pr.title,
      chunkIndex: 0,
    });
    for (const file of pr.files) {
      const chunks = splitPatchIntoChunks(file.patch);
      for (let i = 0; i < chunks.length; i++) {
        result.push({
          prId: pr.id,
          prTitle: pr.title,
          file: file.filename,
          chunk: chunks[i].join('\n'),
          chunkIndex: i,
        });
      }
    }
  }
  return result;
} 