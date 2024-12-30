import { Worker, Job } from 'bullmq';
import { FastifyInstance } from 'fastify';
import { createRedisClient } from '../../core/redis';
import { ProblemGenerationService } from './problem-gen.service';

interface ProblemGenerationJob {
  timestamp: number;
}

export class ProblemGenerationWorker {
  private worker: Worker;

  constructor(
    private readonly problemGenerationService: ProblemGenerationService,
    private readonly fastify: FastifyInstance,
  ) {
    this.worker = new Worker(
      'problem-generation',
      async (job: Job<ProblemGenerationJob>) => {
        return this.processJob(job);
      },
      {
        connection: createRedisClient(),
        concurrency: 1,
      },
    );

    this.initializeWorker();
  }

  private async initializeWorker(): Promise<void> {
    await this.worker.waitUntilReady();
    this.setupListeners();
  }

  private async processJob(job: Job<ProblemGenerationJob>): Promise<void> {
    try {
      this.fastify.log.info(`Starting problem generation job ${job.id}`);

      // Update job progress
      await job.updateProgress(10);

      // Generate the problem
      await this.problemGenerationService.generateDailyProblem();

      await job.updateProgress(100);

      this.fastify.log.info(`Completed problem generation job ${job.id}`);
    } catch (error) {
      this.fastify.log.error(`Problem generation job ${job.id} failed:`, error);
      throw error; // BullMQ will handle retries
    }
  }

  private setupListeners(): void {
    this.worker
      .on('completed', (job) => {
        this.fastify.log.info(`Job ${job.id} completed successfully`);
      })
      .on('failed', (job, error) => {
        this.fastify.log.error(`Job ${job?.id} failed: ${error.message}`, error.stack);
      })
      .on('error', (error) => {
        this.fastify.log.error('Worker error:', error);
      });
  }

  /**
   * Gracefully shutdown the worker
   */
  async close(): Promise<void> {
    await this.worker.close();
  }
}
