import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __corePrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__corePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__corePrisma = prisma;
}
