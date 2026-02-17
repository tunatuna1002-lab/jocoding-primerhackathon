import crypto from 'node:crypto';

export function newId(prefix = 'id'): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
