import { FastifyZod } from 'fastify-zod';
import { models } from '../app/schemas';

declare module 'fastify' {
  interface FastifyInstance {
    readonly zod: FastifyZod<typeof models>;
  }
}
