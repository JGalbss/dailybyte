import * as path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import { ProblemGenerationScheduler } from './modules/problem-generation/problem-scheduler.service';
import { ProblemGenerationWorker } from './modules/problem-generation/problem-gen.worker';
import { ProblemGenerationService } from './modules/problem-generation/problem-gen.service';

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });

  // start the worker
  const problemGenerationService = new ProblemGenerationService(fastify);
  const problemGenerationWorker = new ProblemGenerationWorker(problemGenerationService, fastify);
  const scheduler = new ProblemGenerationScheduler(fastify);

  // schedule the daily problem generation for 10:00 AM EST
  await scheduler.scheduleDaily();

  fastify.addHook('onClose', async () => {
    await problemGenerationWorker.close();
  });
}
