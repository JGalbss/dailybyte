import { db } from '../core/supabase';
import { Languages } from '@dailybyte/shared';
import { codeExecutor } from './code-executor';

export const problemService = {
  runCode: async (code: string, language: Languages, problemId: string) => {
    try {
      const submittedAt = new Date().toISOString();

      const [problem, testCases] = await Promise.all([
        db.from('problems').select('*').eq('id', problemId).single(),
        db.from('testcases').select('*').eq('problem_id', problemId),
      ]);

      if (!problem || !testCases) {
        // dont log test cases
        throw new Error('Problem not found');
      }

      const result = await codeExecutor.execute({
        code,
        language,
        testCases: testCases.data.map((testCase) => ({
          input: testCase.input,
          expectedOutput: testCase.expected,
        })),
      });

      // todo add progress state but we dont have a pending stream
      const submissionData = {
        problem_id: problemId,
        code,
        language,
        status: result.success ? 'success' : 'failed',
        memory_used: result.isolateMetrics.memoryUsedKb,
        time_used_ms: result.isolateMetrics.cpuTimeMs,
        user_id: 'system',
        submitted_at: submittedAt,
      };

      await db.from('submissions').insert(submissionData);

      return submissionData;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'An error occurred while running the code',
      );
    }
  },
};
