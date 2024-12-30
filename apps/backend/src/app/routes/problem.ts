import { FastifyInstance } from 'fastify';
import { CodeExecutorService } from '../modules/code-executor';
import { Languages } from '@dailybyte/shared';
import { Type, Static } from '@fastify/type-provider-typebox';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { queues } from '../core/queue';

const ExecuteSchema = {
  body: Type.Object({
    code: Type.String(),
    language: Type.Enum(Languages),
    problemId: Type.String(),
  }),
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      results: Type.Array(
        Type.Object({
          passed: Type.Boolean(),
          input: Type.Array(Type.Any()),
          expectedOutput: Type.Any(),
          actualOutput: Type.Any(),
          error: Type.Optional(Type.String()),
        }),
      ),
    }),
  },
};

const CreateProblemSchema = {
  response: {
    200: Type.Object({
      success: Type.Boolean(),
      jobId: Type.String(),
    }),
  },
};

type ExecuteBody = Static<typeof ExecuteSchema.body>;

export default async function (fastify: FastifyInstance) {
  const codeExecutor = new CodeExecutorService();

  const problemRoutes: FastifyPluginAsyncTypebox = async (app) => {
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

    app.post<{ Body: ExecuteBody }>('/execute', {
      schema: ExecuteSchema,
      handler: async (request, reply) => {
        try {
          const { code, language, problemId } = request.body;

          const result = await codeExecutor.execute({
            code: `
                function solution(input) {
                  function findTreasurePath(graph, start, treasure) {
                    if (start === treasure) return [start];

                    const queue = [[start]];
                    const visited = new Set();
                    visited.add(start);

                    while (queue.length > 0) {
                      const path = queue.shift();
                      const node = path[path.length - 1];

                      if (node === treasure) {
                        return path;
                      }

                      for (const neighbor of graph[node] || []) {
                        if (!visited.has(neighbor)) {
                          visited.add(neighbor);
                          const newPath = path.slice();
                          newPath.push(neighbor);
                          queue.push(newPath);
                        }
                      }
                    }

                    return [];
                  }

                  const { graph, start, treasure } = input;
                  return findTreasurePath(graph, start, treasure);
                }
              `,
            language: Languages.JavaScript,
            testCases: [
              {
                input: {
                  graph: {
                    Noname: ['Akamai', 'CryptoStart'],
                    Akamai: ['Wiz', 'Wayve'],
                    CryptoStart: ['Wayve'],
                    Wiz: ['TreasureCorp'],
                    Wayve: ['TreasureCorp'],
                    TreasureCorp: [],
                  },
                  start: 'Noname',
                  treasure: 'TreasureCorp',
                },
                expected: ['Noname', 'Akamai', 'Wiz', 'TreasureCorp'],
              },
              {
                input: {
                  graph: {
                    Noname: ['Akamai'],
                    Akamai: ['Noname'],
                  },
                  start: 'Noname',
                  treasure: 'TreasureCorp',
                },
                expected: [],
              },
              {
                input: {
                  graph: {
                    Noname: ['Akamai', 'CryptoStart'],
                    Akamai: ['CryptoStart'],
                    CryptoStart: ['Noname'],
                  },
                  start: 'Noname',
                  treasure: 'Noname',
                },
                expected: ['Noname'],
              },
            ],
          });
          console.log('Execution result:', result);

          return {
            success: result.success,
            results: result.output.map((output, i) => ({
              passed: result.success,
              input: [1, 2],
              expectedOutput: 3,
              actualOutput: output,
            })),
          };
        } catch (err) {
          request.log.error(err);
          reply.status(500).send({
            success: false,
            results: [
              {
                passed: false,
                input: [1, 2],
                expectedOutput: 3,
                actualOutput: null,
                error: err instanceof Error ? err.message : 'Unknown error occurred',
              },
            ],
          });
        }
      },
    });
  };

  fastify.register(problemRoutes, { prefix: '/problem' });
}
