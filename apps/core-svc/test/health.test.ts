import { describe, expect, it } from 'vitest';
import fastify from 'fastify';

describe('core-svc health', () => {
  it('returns 200', async () => {
    const app = fastify();
    app.get('/health', () => ({ status: 'ok', service: 'core-svc' }));
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json().service).toBe('core-svc');
    await app.close();
  });
});
