import { FastifyInstance } from 'fastify';
import { CodeExecutorService } from '../modules/code-executor';
import { Languages } from '@dailybyte/shared';
import { Type, Static } from '@fastify/type-provider-typebox';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { queues } from '../core/queue';
import { db } from '../core/supabase';

const CreateProblemSchema = {
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      jobId: Type.String(),
    }),
  },
};

type CreateProblemResponse = Static<(typeof CreateProblemSchema.response)[200]>;

const SubmitSolutionSchema = {
  body: Type.Object({
    code: Type.String(),
    problemId: Type.String(),
  }),
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      submission: Type.Any(),
      attemptCount: Type.Number(),
    }),
  },
};

type SubmitSolutionBody = Static<typeof SubmitSolutionSchema.body>;

export default async function (fastify: FastifyInstance) {
  const codeExecutor = new CodeExecutorService();

  const problemRoutes: FastifyPluginAsyncTypebox = async (app) => {
    // for testing only
    app.post('/create', {
      schema: CreateProblemSchema,
      handler: async (request, reply) => {
        try {
          const job = await queues.problemGeneration.add('generate-daily-problem', {
            timestamp: Date.now(),
          });

          return {
            success: true,
            jobId: job.id,
          };
        } catch (err) {
          request.log.error(err);
          reply.status(500).send({
            success: false,
            jobId: '',
          });
        }
      },
    });

    // submit a solution
    app.post('/submit', {
      schema: SubmitSolutionSchema,
      handler: async (request, reply) => {
        const { code, problemId } = request.body as SubmitSolutionBody;

        const testCasesResult = await db.from('testcases').select('*').eq('problem_id', problemId);

        if (!testCasesResult.data) {
          return reply.status(404).send({ success: false, message: 'Test cases not found' });
        }

        const testCases = testCasesResult.data;

        const results = await codeExecutor.execute({
          code,
          language: Languages.JavaScript,
          testCases,
        });

        console.log(results);

        const submission = await db
          .from('submissions')
          .insert({
            problem_id: problemId,
            code,
            language: Languages.JavaScript,
            status: results.success ? 'success' : 'failed',
            memory_used: results.isolateMetrics?.memoryUsedKb || 0,
            time_used_ms: results.isolateMetrics?.cpuTimeMs || 0,
            submitted_at: new Date().toISOString(),
            user_id: 'd9476e23-72ee-4630-9df2-44f8f7e5b914',
          })
          .select()
          .single();

        console.log(submission);

        const attemptCount = await db
          .from('submissions')
          .select('*', { count: 'exact' })
          .eq('problem_id', problemId)
          .eq('user_id', 'd9476e23-72ee-4630-9df2-44f8f7e5b914');

        console.log(attemptCount.count);

        return {
          success: true,
          submission,
          attemptCount: attemptCount.count,
        };
      },
    });

    // get the active problem of the day
    app.get('/active', {
      handler: async (request, reply) => {
        try {
          const result = await db
            .from('problems')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!result.data) {
            return reply.status(404).send({
              success: false,
              message: 'No active problem found',
            });
          }

          return {
            success: true,
            problem: result.data,
          };
        } catch (err) {
          request.log.error(err);
          return reply.status(500).send({
            success: false,
            message: 'Error fetching active problem',
          });
        }
      },
    });
  };

  fastify.register(problemRoutes, { prefix: '/problem' });
}
