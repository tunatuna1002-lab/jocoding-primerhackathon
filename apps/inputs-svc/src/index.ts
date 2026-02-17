import fastify from 'fastify';
import { z } from 'zod';
import { logger } from '@repo/shared';
import { Prisma } from '@prisma/client';
import { prisma } from './db';

const app = fastify({ logger });
const port = Number(process.env.PORT ?? 3002);

app.get('/health', async () => ({
  service: 'inputs-svc',
  status: 'ok'
}));

const inputSchema = z.object({
  source: z.string().min(1),
  payload: z.record(z.string(), z.unknown())
});

app.post('/inputs', async (request, reply) => {
  const parsed = inputSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'INVALID_PAYLOAD' });
  }

  const input = await prisma.input.create({
    data: {
      source: parsed.data.source,
      payload: parsed.data.payload
    }
  });

  return input;
});

app.get('/inputs', async () => {
  return prisma.input.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof z.ZodError) {
    return reply.code(400).send({ error: 'INVALID_PAYLOAD', issues: error.issues });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return reply.code(409).send({ error: 'DB_ERROR', code: error.code });
  }
  app.log.error(error);
  return reply.code(500).send({ error: 'INTERNAL_ERROR' });
});

const main = async () => {
  await app.listen({ host: '0.0.0.0', port });
};

main().catch((error) => {
  app.log.error(error);
  process.exit(1);
});
