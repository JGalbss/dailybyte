import fs from 'fs';
import path from 'path';
import { Scraper } from '../../core/scraper';

export interface LeetCodeProblem {
  number: number;
  title: string;
  description: string;
  solution: string;
}

/**
 * Extracts problem information from a LeetCode solution file name
 */
function extractProblemInfo(filePath: string): { number: number; title: string } | null {
  const match = filePath.match(/^(\d+)-(.+)\.js$/);
  if (!match) return null;
  const [_, numberStr, titleKebabCase] = match;
  return {
    number: parseInt(numberStr, 10),
    title: titleKebabCase.replace(/-/g, ' '),
  };
}

/**
 * Scrapes problem description from LeetCode
 */
async function scrapeLeetCodeProblem(problemNumber: number): Promise<string> {
  const scraper = new Scraper();
  const url = `https://leetcode.com/problems/${problemNumber}`;
  return scraper.scrape(url);
}

/**
 * Gets a random LeetCode problem from the library
 */
export async function getRandomProblem(): Promise<LeetCodeProblem> {
  const leetcodePath = path.join(process.cwd(), 'dist/libs/leetcode/src');
  const files = fs.readdirSync(leetcodePath).filter((file) => file.match(/^\d+-.+\.js$/));

  const randomFile = files[Math.floor(Math.random() * files.length)];
  const filePath = path.join(leetcodePath, randomFile);

  const problemInfo = extractProblemInfo(randomFile);
  if (!problemInfo) {
    throw new Error(`Invalid problem file name: ${randomFile}`);
  }

  const [description, solution] = await Promise.all([
    scrapeLeetCodeProblem(problemInfo.number),
    fs.promises.readFile(filePath, 'utf-8'),
  ]);

  return {
    number: problemInfo.number,
    title: problemInfo.title,
    description,
    solution,
  };
}
