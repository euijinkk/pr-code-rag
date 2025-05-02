// github/fetchPRs.ts
import fetch from "node-fetch";
import dotenv from "dotenv";
import type { Response } from "node-fetch";
import path from "path";
import fs from "fs";
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const headers = { Authorization: `token ${GITHUB_TOKEN}` };

export interface PRFile {
  filename: string;
  patch: string;
}

export interface PRDetail {
  id: number;
  title: string;
  files: PRFile[];
}

export async function fetchPullRequests(
  owner: string,
  repo: string,
  count: number = 20
): Promise<PRDetail[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=${count}`;
  const res: Response = await fetch(url, { headers });
  const prs = (await res.json()) as any[];

  // PR 전체 내용을 파일로 저장
  const prsPath = path.resolve(__dirname, "prs.json");
  fs.writeFileSync(prsPath, JSON.stringify(prs, null, 2), "utf-8");
  console.log(`✅ PR 전체 내용이 ${prsPath} 파일에 저장되었습니다.`);

  const prDetails: PRDetail[] = [];

  for (const pr of prs) {
    const filesUrl = pr.url + "/files";
    const filesRes: Response = await fetch(filesUrl, { headers });

    const files: any[] = (await filesRes.json()) as any[];

    // 각 PR의 files 응답을 별도 파일로 저장
    const filesPath = path.resolve(__dirname, `pr-${pr.number}-files.json`);
    fs.writeFileSync(filesPath, JSON.stringify(files, null, 2), "utf-8");
    console.log(
      `✅ PR #${pr.number}의 파일 변경 내용이 ${filesPath} 파일에 저장되었습니다.`
    );

    prDetails.push({
      id: pr.number,
      title: pr.title,
      files: files.map((f: any) => ({
        filename: f.filename,
        patch: f.patch || "",
      })),
    });
  }

  const prDetailsPath = path.resolve(__dirname, "pr-details.json");
  fs.writeFileSync(prDetailsPath, JSON.stringify(prDetails, null, 2), "utf-8");
  console.log(`✅ PR 상세 내용이 ${prDetailsPath} 파일에 저장되었습니다.`);

  return prDetails;
}
