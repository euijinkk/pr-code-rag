import { splitIntoChunks } from './parser';
import fs from 'fs';
import path from 'path';

describe('splitIntoChunks', () => {
  it('should split patch diff into chunks correctly', () => {
    // fixture/test1.json에서 첫 번째 PR의 files[].patch를 모두 모아서 테스트
    const jsonPath = path.join(__dirname, '../fixture/test1.json');
    console.log('jsonPath', jsonPath);
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');

    console.log('fileContent', fileContent);
    // 첫 번째 PR 객체만 파싱
    if (!fileContent) throw new Error('No PR object found');
    const pr = JSON.parse(fileContent);
    const files = pr.files || [];

    console.log('files', files);
    const allPatches = files.map((f: any) => f.patch).filter(Boolean).join('\n');
    const lines = allPatches.split('\n');

    const chunks = splitIntoChunks(lines);

    console.log('chunks', chunks);

    expect(chunks.length).toBeGreaterThan(0);
    for (let i = 0; i < chunks.length - 1; i++) {
      expect(chunks[i].length).toBeGreaterThanOrEqual(5);
      expect(chunks[i].length).toBeLessThanOrEqual(30);
    }
    const totalLines = chunks.reduce((acc: number, chunk: string[]) => acc + chunk.length, 0);
    expect(totalLines).toBe(lines.length);
  });
}); 