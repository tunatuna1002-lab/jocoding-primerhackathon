import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __inputsPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__inputsPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__inputsPrisma = prisma;
}
