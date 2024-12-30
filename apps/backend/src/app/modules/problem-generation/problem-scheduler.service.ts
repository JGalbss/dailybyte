import { FastifyInstance } from 'fastify';
import { Queue, Job } from 'bullmq';
import { queues } from '../../core/queue';

interface ProblemGenerationJob {
  timestamp: number;
}

export class ProblemSchedulerService {
  private readonly queue: Queue;

  constructor(private readonly fastify: FastifyInstance) {
    this.queue = queues.problemGeneration;
  }

  /**
   * Initializes the problem generation schedule
   */
  async initialize(): Promise<void> {
    try {
      // Clean up any existing schedules first
      await this.removeExistingSchedules();

      // Schedule new daily job
      await this.scheduleDailyGeneration();

      this.fastify.log.info('Problem generation schedule initialized');
    } catch (error) {
      this.fastify.log.error('Failed to initialize problem scheduler:', error);
      throw error;
    }
  }

  /**
   * Removes any existing scheduled jobs
   */
  private async removeExistingSchedules(): Promise<void> {
    const repeatableJobs = await this.queue.getRepeatableJobs();
    await Promise.all(
      repeatableJobs.map((job) => this.queue.removeRepeatableByKey(job.key))
    );
  }

  /**
   * Schedules the daily problem generation
   */
  private async scheduleDailyGeneration(): Promise<void> {
    await this.queue.add(
      'generate-daily-problem',
      { timestamp: Date.now() },
      {
        repeat: {
          pattern: '0 14 * * *', // 10 AM EST (14:00 UTC)
          tz: 'UTC'
        },
        jobId: 'daily-problem-generation' // Fixed ID for easy tracking
      }
    );
  }

  /**
   * Gets the next scheduled generation time
   */
  async getNextGenerationTime(): Promise<Date | null> {
    const repeatableJobs = await this.queue.getRepeatableJobs();
    const nextJob = repeatableJobs.find(
      (job) => job.name === 'generate-daily-problem'
    );
    return nextJob ? new Date(nextJob.next) : null;
  }

  /**
   * Manually triggers problem generation
   */
  async triggerGeneration(): Promise<Job<ProblemGenerationJob>> {
    return await this.queue.add(
      'generate-daily-problem',
      { timestamp: Date.now() },
      { jobId: `manual-generation-${Date.now()}` }
    );
  }

  /**
   * Gets the status of the last generation job
   */
  async getLastGenerationStatus(): Promise<{
    status: 'completed' | 'failed' | 'pending' | 'not_found';
    timestamp?: number;
    error?: string;
  }> {
    const jobs = await this.queue.getJobs(['completed', 'failed']);
    const lastJob = jobs[jobs.length - 1];

    if (!lastJob) {
      return { status: 'not_found' };
    }

    const state = await lastJob.getState();
    const result = {
      status: state as 'completed' | 'failed' | 'pending',
      timestamp: lastJob.timestamp
    };

    if (state === 'failed') {
      result['error'] = lastJob.failedReason;
    }

    return result;
  }

  /**
   * Cleans up the scheduler
   */
  async cleanup(): Promise<void> {
    await this.queue.close();
  }
} 