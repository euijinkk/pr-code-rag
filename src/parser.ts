// 📦 코드 파일을 언어 중립적으로 chunk 분할하는 스크립트
// 기준: 블록 시작 키워드 감지 + 최대 줄 수 제한 + 짧은 블록 병합

import fs from 'fs';
import path from 'path';

// ✅ 블록 시작 키워드 집합 (언어 중립)
const BLOCK_KEYWORDS: string[] = [
  'function', 'class', 'interface', 'enum', 'const', 'let', 'var', 'val', 'fun', 'def',
  'public', 'private', 'protected', 'override', 'export'
];

const MAX_CHUNK_LINES: number = 30;
const MIN_CHUNK_LINES: number = 5;

function isBlockStart(line: string): boolean {
  const trimmed: string = line.trim();
  return BLOCK_KEYWORDS.some((keyword: string) => trimmed.startsWith(keyword));
}

export function splitIntoChunks(lines: string[]): string[][] {
  const chunks: string[][] = [];
  let currentChunk: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i];
    const isNewBlock: boolean = isBlockStart(line);

    if (
      currentChunk.length >= MAX_CHUNK_LINES ||
      (isNewBlock && currentChunk.length >= MIN_CHUNK_LINES)
    ) {
      chunks.push(currentChunk);
      currentChunk = [];
    }

    currentChunk.push(line);
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  // 병합: 너무 짧은 chunk는 앞뒤와 합치기
  const merged: string[][] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (
      i > 0 &&
      chunks[i].length < MIN_CHUNK_LINES &&
      merged.length > 0
    ) {
      merged[merged.length - 1] = merged[merged.length - 1].concat(chunks[i]);
    } else {
      merged.push(chunks[i]);
    }
  }

  return merged;
}

/**
 * 여러 언어에서 사용할 수 있도록, patch(코드 diff) 문자열을 받아 chunk로 나누는 순수 함수
 * @param patchStr patch(diff) 전체 문자열
 * @returns string[][] chunk로 나눠진 2차원 배열
 */
export function splitPatchIntoChunks(patchStr: string): string[][] {
  const lines = patchStr.split('\n');
  return splitIntoChunks(lines);
}


