import { FastifyInstance } from 'fastify';
import { getNewsHeadlines, PROBLEM_TOPICS } from './topics';
import z from 'zod';
import { Languages } from '@dailybyte/shared';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { ExecutionResult, TestCaseSchema } from '../../schemas';
import { codeExecutor } from '../code-executor';
import { validateAndSanitizeCode } from '../code-executor/utils';

interface Topic {
  theme: { title: string; description: string };
  topic: string;
  category: keyof typeof PROBLEM_TOPICS;
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
      const plan = await this.generatePlan(topic);
      const problem = await this.generateProblem(plan);
      const testCases = await this.generateTestCases(problem);
      const solutionPlan = await this.solutionPlan(problem);
      const solution = await this.generateSolution(problem, testCases, solutionPlan);

      console.log(solution);
      this.fastify.log.info('Successfully generated daily problem');
    } catch (err) {
      this.fastify.log.error('Failed to generate daily problem:', err);
      throw err;
    }
  }

  async generateTopic(): Promise<Topic> {
    const categories = Object.keys(PROBLEM_TOPICS) as Array<keyof typeof PROBLEM_TOPICS>;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const topicsInCategory = PROBLEM_TOPICS[randomCategory];
    const randomTopic = topicsInCategory[Math.floor(Math.random() * topicsInCategory.length)];

    const news = await getNewsHeadlines();
    const selectedNews = news[Math.floor(Math.random() * news.length)];

    return {
      theme: selectedNews,
      topic: randomTopic,
      category: randomCategory,
    };
  }

  async generatePlan(topic: Topic): Promise<string> {
    const { text: plan } = await generateText({
      model: openai('o1-mini'),
      prompt: `Create a detailed plan for developing a LeetCode-style coding problem that combines ${topic.topic} from the ${topic.category} category with themes from this news headline: "${topic.theme.title}".

The plan should outline:

1. Core Technical Components:
- How to incorporate the ${topic.category} concepts effectively
- What specific aspects of ${topic.topic} should be tested
- Key algorithms and data structures needed
- Edge cases to consider
- Time/space complexity targets

2. Problem Structure:
- How to frame the technical challenge within the news context
- Input/output format design
- Test case progression (easy -> complex)
- Common pitfalls to include
- Optimization opportunities

3. Educational Value:
- Key learning objectives
- Common misconceptions to address
- Helpful hints or examples to provide
- Related problems or concepts to reference

4. Implementation Strategy:
- JavaScript-specific considerations
- Input validation requirements
- Error handling approach
- Performance constraints

Please provide a structured outline of these elements to guide problem creation.`,
    });

    return plan;
  }

  async generateProblem(plan: string): Promise<ProblemGeneration> {
    const { object: problemGeneration } = await generateObject({
      model: openai('gpt-4o'),
      schema: problemGenerationSchema,
      prompt: `You are a witty software engineer creating an engaging yet challenging JavaScript coding problem.

Follow this plan to create the problem:

${plan}

Based on this plan, create a coding problem that:
- Follows the technical components and structure outlined above
- Is challenging but solvable in 45-60 minutes
- Has clear input/output specifications
- Uses JavaScript-specific features and best practices
- Considers JavaScript's type system and common pitfalls

Please provide:
- A clever title that incorporates both the technical concept and a pun or wordplay
- An engaging problem description including:
  - A clear scenario/backstory
  - Technical requirements and constraints
  - Input/output specifications with sample cases
  - At least one detailed example
  - JavaScript-specific implementation details
  - Time/space complexity requirements

Format the response as a JSON object with:
{
  "title": "Your title here",
  "description": "Full problem description here"
}

Remember: The problem should be technically sound and appropriate for a technical interview, while following the educational objectives and implementation strategy from the plan.`,
    });

    console.log(problemGeneration);

    return problemGeneration as ProblemGeneration;
  }

  async generateTestCases(problem: ProblemGeneration): Promise<TestCase[]> {
    const { object: response } = await generateObject({
      model: openai('gpt-4o'),
      schema: z
        .object({
          testCases: z.array(testCaseSchema),
        })
        .strict(),
      prompt: `Generate a comprehensive set of test cases for the following coding problem:

Title: ${problem.title}
Description: ${problem.description}

Please create test cases that:
1. Cover basic/simple scenarios
2. Include edge cases and corner cases
3. Test boundary conditions
4. Include complex scenarios that thoroughly test the solution
5. Have descriptive names explaining what each test case verifies

IMPORTANT: Only include test cases where you are completely confident about both the input and expected output. If you have any uncertainty about the expected behavior, omit that test case.

For each test case, provide:
- Input values
- Expected output
- A brief description of what the test case is checking

Input and output values must be valid JavaScript values that can be directly passed to functions.
Valid formats include:
- Numbers (e.g., 42, -1, 3.14)
- Strings (e.g., "hello", "test")
- Arrays (e.g., [1, 2, 3], ["a", "b"])
- Objects (e.g., { key: "value" })
- Booleans (true/false)
- null

Do not include functions or undefined values in inputs or outputs.
Do not include any test cases where you are unsure about the expected output.

Format as a JSON object with a testCases array:
{
  "testCases": [
    {
      "input": <input value>,
      "expectedOutput": <expected output>,
      "description": "Description of what this test verifies"
    }
  ]
}

Generate at least 5 test cases covering a wide range of scenarios, but only include cases where you can determine the correct output with absolute certainty.`,
    });

    return response.testCases.map((testCase) => ({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      description: testCase.description,
    }));
  }

  async solutionPlan(problem: ProblemGeneration): Promise<string> {
    const { text: plan } = await generateText({
      model: openai('o1-mini'),
      prompt: `Create a detailed solution plan for: ${problem.title}

Please include:

1. Analysis of edge cases and constraints:
   - Input validation and error handling
   - Boundary conditions to consider
   - Special cases that need handling
   - Input size limitations and performance implications

2. Time and space complexity requirements:
   - Target runtime complexity
   - Memory usage constraints 
   - Tradeoffs between different approaches

3. Data structure selection:
   - Recommended data structures
   - Justification for choices
   - Space/time tradeoffs

4. Algorithm approach:
   - High-level solution strategy
   - Key steps in the algorithm
   - How to handle the identified edge cases
   - Any preprocessing needed

5. Optimization opportunities:
   - Areas for performance improvement
   - Caching or memoization potential
   - Early termination conditions

6. Implementation considerations:
   - Helper functions needed
   - Important variables to track
   - Error checking points
   - Input validation approach

Please provide a structured plan addressing all these aspects to guide the implementation.`,
    });

    return plan;
  }
  async generateSolution(
    problem: ProblemGeneration,
    testCases: TestCase[],
    solutionPlan: string,
    error?: string,
    attempt: number = 1,
    previousErrors: string[] = [],
    previousSolution?: string,
  ): Promise<string> {
    if (attempt > 5) {
      throw new Error(
        `Failed to generate valid solution after 3 attempts. Errors encountered: ${previousErrors.join(
          ' | ',
        )}`,
      );
    }

    const { text: solution } = await generateText({
      model: openai('gpt-4o'),
      prompt: `${problem.title}

${problem.description}

Solution Plan:
${solutionPlan}

Test Cases:
${testCases
  .map(
    (testCase) => `
Input: ${JSON.stringify(testCase.input)}
Expected Output: ${JSON.stringify(testCase.expectedOutput)}
Description: ${testCase.description}`,
  )
  .join('\n')}

${error ? `Previous errors:\n${[...previousErrors, error].join('\n')}` : ''}
${previousSolution ? `\nPrevious solution that failed:\n${previousSolution}` : ''}

IMPORTANT: The input parameter will be passed directly as a JavaScript value. DO NOT parse it with JSON.parse().

Return ONLY the solution function with NO MARKDOWN FENCING OR ADDITIONAL TEXT. For example:
function solution(input) {
  const result = input.map(x => x * 2);
  return result;
}`,
    });

    const cleanedSolution = validateAndSanitizeCode(solution);
    console.log(cleanedSolution);
    const executionResult = await this.evaluateSolution(cleanedSolution, testCases);

    const { success, testCaseResults, logs } = executionResult;

    if (!success) {
      const failedTests = testCaseResults
        .map((result, index) => (!result.success ? index : null))
        .filter((index): index is number => index !== null);

      const errorLogs = logs.length > 0 ? `\nExecution logs: ${logs.join('\n')}` : '';
      const newError = `Attempt ${attempt}: Solution failed test cases ${failedTests.join(
        ', ',
      )}. Please review the requirements and try again.${errorLogs}`;

      return this.generateSolution(
        problem,
        testCases,
        solutionPlan,
        newError,
        attempt + 1,
        error ? [...previousErrors, error] : previousErrors,
        cleanedSolution,
      );
    }

    return cleanedSolution;
  }

  async evaluateSolution(solution: string, testCases: TestCase[]): Promise<ExecutionResult> {
    try {
      const result = await codeExecutor.execute({
        code: solution,
        language: Languages.JavaScript,
        testCases: testCases.map((testCase) => ({
          input: testCase.input,
          expected: testCase.expectedOutput,
        })),
      });

      return result;
    } catch (err) {
      this.fastify.log.error('Error evaluating solution:', err);
      return {
        success: false,
        output: [],
        logs: [err instanceof Error ? err.message : String(err)],
        executionTime: 0,
        testCaseResults: [],
        isolateMetrics: { cpuTimeMs: 0, wallTimeMs: 0, memoryUsedKb: 0 },
      };
    }
  }
}
