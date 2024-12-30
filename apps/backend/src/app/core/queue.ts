import { Queue } from 'bullmq';
import { createRedisClient } from './redis';

const QUEUE_NAMES = {
  PROBLEM_GENERATION: 'problem-generation',
} as const;

type QueueNames = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/**
 * Creates a new Bull queue with default configuration
 */
function createQueue(name: QueueNames): Queue {
  return new Queue(name, {
    connection: createRedisClient(),
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  });
}

// Export configured queues
export const queues = {
  problemGeneration: createQueue(QUEUE_NAMES.PROBLEM_GENERATION),
};
