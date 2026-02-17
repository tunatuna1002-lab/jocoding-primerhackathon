import fastify from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '@repo/shared';
import { prisma } from './db';

const app = fastify({ logger });
const port = Number(process.env.PORT ?? 3001);

app.get('/health', async () => ({
  service: 'users-svc',
  status: 'ok'
}));

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1)
});

app.post('/users', async (request, reply) => {
  const parsed = userSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'INVALID_PAYLOAD' });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name
    }
  });

  return user;
});

app.get('/users/:id', async (request, reply) => {
  const id = (request.params as { id: string }).id;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return reply.code(404).send({ error: 'USER_NOT_FOUND' });
  }

  return user;
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
