import { z } from 'zod';
import { Languages } from '@dailybyte/shared';

// Base schemas
// dup of our db schema in shared
export const TestCaseSchema = z.object({
  input: z.any(),
  expected: z.any(),
  problem_id: z.string(),
  created_at: z.string().optional(),
  id: z.string().optional(),
});

export const ExecutionRequestSchema = z.object({
  code: z.string(),
  language: z.nativeEnum(Languages),
  testCases: z.array(TestCaseSchema),
});

export const TestCaseResultSchema = z.object({
  success: z.boolean(),
  output: z.unknown().nullable(),
  error: z.string().optional(),
  executionTime: z.number(),
});

export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  output: z.array(z.unknown()),
  logs: z.array(z.unknown()),
  executionTime: z.number(),
  testCaseResults: z.array(TestCaseResultSchema),
  isolateMetrics: z.object({
    cpuTimeMs: z.number(),
    wallTimeMs: z.number(),
    memoryUsedKb: z.number(),
  }),
});

// Export all schemas for fastify-zod
export const models = {
  TestCase: TestCaseSchema,
  ExecutionRequest: ExecutionRequestSchema,
  TestCaseResult: TestCaseResultSchema,
  ExecutionResult: ExecutionResultSchema,
};

// Type exports
export type TestCase = z.infer<typeof TestCaseSchema>;
export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>;
export type TestCaseResult = z.infer<typeof TestCaseResultSchema>;
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
