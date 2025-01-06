import { FastifyInstance } from 'fastify';
import { getNewsHeadlines } from './topics';
import z from 'zod';
import { Languages } from '@dailybyte/shared';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { ExecutionResult, TestCaseSchema } from '../../schemas';
import { codeExecutor } from '../code-executor';
import { validateAndSanitizeCode } from '../code-executor/utils';
import { db } from '../../core/supabase';
import { getRandomProblem, LeetCodeProblem } from './leetcode';

interface Topic {
  theme: { title: string; description: string };
  problem: LeetCodeProblem;
}

const problemGenerationSchema = z
  .object({
    title: z.string(),
    description: z.string(),
  })
  .strict();

export interface ProblemGeneration {
  title: string;
  description: string;
}

const testCaseSchema = z
  .object({
    input: z.unknown(),
    expectedOutput: z.unknown(),
    description: z.string(),
  })
  .strict();

interface TestCase {
  input: unknown;
  expectedOutput: unknown;
  description: string;
}

export class ProblemGenerationService {
  constructor(private readonly fastify: FastifyInstance) {}

  async generateDailyProblem(): Promise<void> {
    try {
      const topic = await this.generateTopic();
      const problem = await this.generateProblem(topic);
      const solution = await this.generateSolution(topic);
      const testCases = await this.generateTestCases(topic.problem, solution);
      const explanation = await this.solutionExplanation(solution, problem, testCases);

      // now insert problem to launch at 12pm EST
      const { data: problemData, error: problemError } = await db
        .from('problems')
        .insert({
          title: problem.title,
          description: problem.description,
          launch_date: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
          slug: problem.title.toLowerCase().replace(/ /g, '-'),
        })
        .select()
        .single();

      if (!problemData || problemError) {
        throw new Error('Failed to insert problem');
      }

      // insert the test cases
      const testCaseInserts = testCases.map((testCase) =>
        db
          .from('testcases')
          .insert({
            problem_id: problemData.id,
            input: JSON.stringify(testCase.input),
            expected: JSON.stringify(testCase.expectedOutput),
          })
          .select()
          .single(),
      );

      const results = await Promise.all(testCaseInserts);
      const testCasesError = results.find((result) => result.error)?.error;
      const testCasesData = results.map((result) => result.data);

      if (!testCasesData || testCasesError) {
        throw new Error('Failed to insert test cases');
      }

      // now insert a solution to the problem
      const { data: solutionData, error: solutionError } = await db
        .from('solutions')
        .insert({
          problem_id: problemData.id,
          solution: solution,
          explanation: explanation,
        })
        .select();

      if (!solutionData || solutionError) {
        throw new Error('Failed to insert solution');
      }

      this.fastify.log.info('Successfully generated daily problem');
    } catch (err) {
      this.fastify.log.error('Failed to generate daily problem:', err);
      throw err;
    }
  }

  async generateTopic(): Promise<Topic> {
    const news = await getNewsHeadlines();
    const selectedNews = news[Math.floor(Math.random() * news.length)];
    const problem = await getRandomProblem();

    return {
      theme: selectedNews,
      problem: problem,
    };
  }

  async generateProblem(topic: Topic): Promise<ProblemGeneration> {
    const { object: problemGeneration } = await generateObject({
      model: openai('gpt-4o'),
      schema: problemGenerationSchema,
      prompt: `You are a witty software engineer creating an engaging yet challenging JavaScript coding problem.

I'll provide you with a LeetCode problem and a news headline. Your task is to rewrite the LeetCode problem to incorporate themes from the news headline while preserving the core technical challenge.

Original LeetCode Problem:
${topic.problem.description}


News Theme to Incorporate:
Title: ${topic.theme.title}
Description: ${topic.theme.description}

Important: The underlying technical solution (${topic.problem.solution}) must still work for your rewritten problem. The goal is to make the problem more engaging and fun while keeping the same logical structure.

Create a coding problem that:
- Maintains the exact same technical requirements and solution approach as the original LeetCode problem
- Creatively incorporates elements from the news headline into the problem narrative
- Is challenging but solvable in 45-60 minutes
- Has clear input/output specifications matching the original problem
- Uses JavaScript-specific features and best practices
- Includes witty references or wordplay related to the news theme

Please provide:
- A clever title that combines the technical concept with the news theme
- An engaging problem description in markdown format including:
  - A backstory that weaves in the news theme
  - Technical requirements and constraints (matching the original problem)
  - Input/output specifications with sample cases
  - At least one detailed example with code blocks
  - JavaScript-specific implementation details
  - Time/space complexity requirements (matching the original problem)

Format the response as a JSON object with:
{
  "title": "Your title here", 
  "description": "# Problem Title\n\n[Problem description in markdown format]\n\n## Examples\n\n\`\`\`javascript\n// Code examples\n\`\`\`\n\n## Constraints\n\n- Time complexity: O(n)\n- Space complexity: O(1)\n\n## Notes\n\n[Additional notes in markdown]"
}

Remember: While making the problem more engaging with the news theme, it's crucial that the technical challenge and solution approach remain identical to the original LeetCode problem. The solution code must work for both the original and your rewritten version.`,
    });

    return problemGeneration as ProblemGeneration;
  }

  async generateTestCases(problem: LeetCodeProblem, solution: string): Promise<TestCase[]> {
    const { object: testCases } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.array(testCaseSchema),
      prompt: `Given this problem:
${problem.title}
${problem.description}

And this solution code:
${solution}

Generate 5-10 diverse test cases that thoroughly test the solution. Include:
- Edge cases (empty input, boundary values, etc)
- Common cases
- Complex cases that test multiple aspects

For each test case provide:
- Input value(s) that match the solution's parameter types
- A description explaining what the test case is checking

Format as an array of test case objects:
[
  {
    "input": <input value>,
    "expectedOutput": null,
    "description": "Description of what this test case checks"
  }
]

The input values should be valid JavaScript that matches the solution's parameter types.`,
    });

    // Execute each test case through the solution to get expected outputs
    const testCasesWithOutputs = await Promise.all(
      testCases.map(async (testCase) => {
        const result = await codeExecutor.execute({
          code: solution,
          language: Languages.JavaScript,
          testCases: [{ input: testCase.input }],
        });

        return {
          input: testCase.input,
          expectedOutput: result.output?.[0],
          description: testCase.description,
        } satisfies TestCase;
      }),
    );

    return testCasesWithOutputs;
  }

  async generateSolution(topic: Topic): Promise<string> {
    const { text: formattedSolution } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Given this coding problem:

${topic.problem.title}
${topic.problem.description}

And this solution:
${topic.problem.solution}

Please rewrite the solution to:
1. Have a main function named 'solution' that takes a single 'input' parameter
2. Keep any helper functions but ensure they are properly scoped
3. Maintain the same logic but format it according to the required structure

The output should be in this format:
function solution(input) {
  // Main solution logic
  return output;
}

// Any helper functions if needed
function helperFunction() {
  // Helper logic
}

Return ONLY the solution code with NO markdown or additional text.`,
    });

    // Extract and format the solution function
    return validateAndSanitizeCode(formattedSolution)
      .replace(/```[^\n]*\n|```$/g, '')
      .trim();
  }

  async solutionExplanation(
    solution: string,
    problem: ProblemGeneration,
    testCases: TestCase[],
  ): Promise<string> {
    const { text: explanation } = await generateText({
      model: openai('o1-mini'),
      prompt: `Write a detailed LeetCode-style solution explanation for this coding problem.

Problem:
${problem.title}
${problem.description}

Solution Code:
${solution}

Example Test Cases:
${testCases
  .map(
    (tc, i) => `
Test Case ${i + 1}:
Input: ${JSON.stringify(tc.input)}
Expected Output: ${JSON.stringify(tc.expectedOutput)}
Description: ${tc.description}
`,
  )
  .join('\n')}

Please explain:
1. The intuition/approach behind the solution
2. A step-by-step walkthrough of how the code works
3. The time and space complexity analysis
4. Any key insights or patterns used
5. Alternative approaches that could work
6. Common pitfalls to avoid

Format the explanation clearly with headers and code examples where relevant.`,
    });

    return explanation;
  }
}
