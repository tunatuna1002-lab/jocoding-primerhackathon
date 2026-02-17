import { describe, expect, it } from 'vitest';
import fastify from 'fastify';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const create = async () => {
  const app = fastify();
  app.get('/health', () => ({ status: 'ok', service: 'users-svc' }));
  await app.ready();
  return app;
};

describe('users-svc health', () => {
  it('returns 200', async () => {
    const app = await create();
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json().service).toBe('users-svc');
    await app.close();
  });
});
