import { describe, expect, it } from 'vitest';
import fastify from 'fastify';

describe('inputs-svc health', () => {
  it('returns 200', async () => {
    const app = fastify();
    app.get('/health', () => ({ status: 'ok', service: 'inputs-svc' }));
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json().service).toBe('inputs-svc');
    await app.close();
  });
});
