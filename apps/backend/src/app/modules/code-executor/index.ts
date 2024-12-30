import ivm from 'isolated-vm';
import { ExecutionResult, TestCase, TestCaseResult } from '../../schemas';
import { ExecutionRequest } from '../../schemas';
import { createContextUtils, validateAndSanitizeCode } from './utils';

export class CodeExecutorService {
  private readonly DEFAULT_MEMORY_LIMIT = 512;
  private readonly DEFAULT_TIMEOUT = 1000;

  /**
   * Executes code with test cases in an isolated VM environment
   * @param request The execution request containing code and test cases
   * @returns Results of code execution across all test cases
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = performance.now();
    let isolate: ivm.Isolate | null = null;
    const logs: unknown[] = [];

    let isolateStartCpuTime: bigint;
    let isolateStartWallTime: bigint;
    let isolateStartMemoryStats: ivm.HeapStatistics;

    try {
      const context = await this.createIsolatedContext(logs);
      isolate = context.isolate;

      // code performance metrics
      isolateStartCpuTime = isolate.cpuTime;
      isolateStartWallTime = isolate.wallTime;
      isolateStartMemoryStats = await isolate.getHeapStatistics();

      const results = await this.executeTestCases(context.context, request.code, request.testCases);

      const cpuTimeNs = isolate.cpuTime - isolateStartCpuTime;
      const wallTimeNs = isolate.wallTime - isolateStartWallTime;
      const currentMemoryStats = await isolate.getHeapStatistics();
      const memoryUsedBytes =
        currentMemoryStats.total_heap_size - isolateStartMemoryStats.total_heap_size;

      return this.createSuccessResult(results, logs, startTime, {
        cpuTimeMs: Number(cpuTimeNs) / 1_000_000,
        wallTimeMs: Number(wallTimeNs) / 1_000_000,
        memoryUsedKb: Math.round(memoryUsedBytes / 1024),
      });
    } catch (error) {
      console.error('Error executing code:', error);
      return this.createErrorResult(logs, startTime);
    } finally {
      await this.disposeIsolate(isolate);
    }
  }

  private async createIsolatedContext(
    logs: unknown[],
  ): Promise<{ isolate: ivm.Isolate; context: ivm.Context }> {
    const isolate = new ivm.Isolate({ memoryLimit: this.DEFAULT_MEMORY_LIMIT });
    const context = await isolate.createContext();
    const jail = context.global;

    await jail.set('global', jail.derefInto());
    await jail.set('log', this.createLogFunction(logs));
    await context.eval(createContextUtils());

    return { isolate, context };
  }

  private createLogFunction(logs: unknown[]): (...args: unknown[]) => void {
    return function (...args: unknown[]) {
      const flatArgs = args.flat();
      logs.push(flatArgs);
      console.log(...flatArgs);
    };
  }

  private async executeTestCases(
    context: ivm.Context,
    code: string,
    testCases: TestCase[],
  ): Promise<TestCaseResult[]> {
    return Promise.all(testCases.map((testCase) => this.runTestCase(context, code, testCase)));
  }

  private createSuccessResult(
    results: TestCaseResult[],
    logs: unknown[],
    startTime: number,
    isolateMetrics: { cpuTimeMs: number; wallTimeMs: number; memoryUsedKb: number },
  ): ExecutionResult {
    return {
      success: results.every((r) => r.success),
      output: results.map((r) => r.output),
      logs,
      executionTime: performance.now() - startTime,
      testCaseResults: results,
      isolateMetrics,
    };
  }

  private createErrorResult(logs: unknown[], startTime: number): ExecutionResult {
    return {
      success: false,
      output: [],
      logs,
      executionTime: performance.now() - startTime,
      testCaseResults: [],
      isolateMetrics: { cpuTimeMs: 0, wallTimeMs: 0, memoryUsedKb: 0 },
    };
  }

  private async disposeIsolate(isolate: ivm.Isolate | null): Promise<void> {
    if (!isolate) return;
    try {
      isolate.dispose();
    } catch (error) {
      console.error('Error disposing isolate:', error);
    }
  }

  private async runTestCase(
    context: ivm.Context,
    code: string,
    testCase: TestCase,
  ): Promise<TestCaseResult> {
    const startTime = performance.now();
    try {
      // Run the test case in the isolated VM
      const script = await context.eval(`
        (function(code, input, expected) {
          return executeTestCase(code, input, expected);
        })
      `);

      // Execute the test case with the provided code, input, and expected output
      // we pass undefined as the first argument because the function is not a constructor
      const result = await script.apply(undefined, [code, testCase.input, testCase.expected], {
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: performance.now() - startTime,
      };
    }
  }
}

export const codeExecutor = new CodeExecutorService();
