import { Queue } from 'bullmq';
import { FastifyInstance } from 'fastify';
import { createRedisClient } from '../../core/redis';

export class ProblemGenerationScheduler {
  private queue: Queue;

  constructor(private readonly fastify: FastifyInstance) {
    this.queue = new Queue('problem-generation', {
      connection: createRedisClient(),
    });
  }

  public async scheduleDaily(): Promise<void> {
    try {
      await this.queue.add(
        'daily-problem',
        { timestamp: Date.now() },
        {
          repeat: {
            pattern: '0 10 * * *', // Every day at 10:00 AM
            tz: 'America/New_York', // Specify your timezone here
          },
        },
      );
      this.fastify.log.info('Daily problem generation job scheduled successfully');
    } catch (error) {
      this.fastify.log.error('Failed to schedule daily problem generation:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    await this.queue.close();
  }
}
