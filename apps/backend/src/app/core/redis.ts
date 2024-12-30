import Redis from 'ioredis';
import { system, SystemProp } from './system';

const REDIS_URL = system.getOrThrow(SystemProp.REDIS_URL);

export function createRedisClient(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });
  return client;
}
