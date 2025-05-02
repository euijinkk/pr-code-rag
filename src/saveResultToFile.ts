import fs from 'fs';
import path from 'path';

export function saveResultToFile(data: any, filename = 'chroma_result.json') {
  const filePath = path.resolve(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ 결과가 ${filePath} 파일에 저장되었습니다.`);
} 