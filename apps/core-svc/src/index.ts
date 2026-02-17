import fastify from 'fastify';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { logger } from '@repo/shared';
import { assertBulletVariantRequiresClaims, assertClaimEvidenceConsistency } from './rules';
import { prisma } from './db';

const app = fastify({ logger });
const port = Number(process.env.PORT ?? 3003);

type PrismaTx = Prisma.TransactionClient;

app.get('/health', async () => ({
  service: 'core-svc',
  status: 'ok'
}));

const claimPayload = z.object({
  inputId: z.string().min(1),
  confidence: z.enum(['low', 'medium', 'high']),
  status: z.enum(['candidate', 'verified', 'rejected']),
  evidences: z
    .array(
      z.object({
        source: z.string().min(1),
        content: z.string().min(1)
      })
    )
    .default([]),
  provenance: z.object({
    actorType: z.string().min(1),
    actorId: z.string().min(1),
    action: z.string().min(1)
  })
});

app.post('/claims', async (request, reply) => {
  const parsed = claimPayload.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'INVALID_PAYLOAD', issues: parsed.error.issues });
  }

  try {
    const result = await prisma.$transaction(async (tx: PrismaTx) => {
      const { inputId, confidence, status, evidences, provenance } = parsed.data;
      assertClaimEvidenceConsistency(status, confidence, evidences.length);

      const claim = await tx.claim.create({
        data: {
          inputId,
          confidence,
          status
        }
      });

      if (evidences.length > 0) {
        await tx.evidence.createMany({
          data: evidences.map((item) => ({
            claimId: claim.id,
            source: item.source,
            content: item.content
          }))
        });
      }

      await tx.provenance.create({
        data: {
          claimId: claim.id,
          actorType: provenance.actorType,
          actorId: provenance.actorId,
          action: provenance.action
        }
      });

      return tx.claim.findUniqueOrThrow({
        where: { id: claim.id },
        include: {
          evidences: true,
          provenances: true
        }
      });
    });

    return reply.code(201).send(result);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return reply.code(409).send({ error: 'DB_ERROR', code: error.code });
    }

    if (error instanceof Error && error.message.startsWith('CLAIM_')) {
      return reply.code(409).send({ error: error.message });
    }

    app.log.error(error);
    return reply.code(500).send({ error: 'INTERNAL_ERROR' });
  }
});

const variantPayload = z.object({
  target: z.enum(['draft', 'section', 'bullet']),
  claimIds: z.array(z.string().min(1)).default([])
});

app.post('/variants', async (request, reply) => {
  const parsed = variantPayload.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'INVALID_PAYLOAD', issues: parsed.error.issues });
  }

  const { target, claimIds } = parsed.data;

  try {
    assertBulletVariantRequiresClaims(target, claimIds);

    const claims = await prisma.claim.findMany({
      where: { id: { in: claimIds } }
    });

    if (claims.length !== claimIds.length) {
      return reply.code(404).send({ error: 'SOME_CLAIMS_NOT_FOUND' });
    }

    const created = await prisma.variant.create({
      data: {
        target,
        claimLinks: {
          create: claimIds.map((claimId, sortOrder) => ({
            claim: { connect: { id: claimId } },
            sortOrder
          }))
        }
      },
      include: {
        claimLinks: {
          include: {
            claim: true
          }
        }
      }
    });

    return reply.code(201).send(created);
  } catch (error: any) {
    if (error instanceof Error && error.message.startsWith('BULLET_VARIANT')) {
      return reply.code(409).send({ error: error.message });
    }
    app.log.error(error);
    return reply.code(500).send({ error: 'INTERNAL_ERROR' });
  }
});

const exportVersionPayload = z.object({
  variantIds: z.array(z.string().min(1)).min(1),
  status: z.enum(['draft', 'published']).default('draft')
});

app.post('/export-versions', async (request, reply) => {
  const parsed = exportVersionPayload.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'INVALID_PAYLOAD', issues: parsed.error.issues });
  }

  const { variantIds, status } = parsed.data;

  try {
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: {
        claimLinks: {
          include: {
            claim: {
              include: {
                evidences: true
              }
            }
          }
        }
      }
    });

    if (variants.length !== variantIds.length) {
      return reply.code(404).send({ error: 'SOME_VARIANTS_NOT_FOUND' });
    }

    const invalid = variants.flatMap((variant) =>
      variant.claimLinks.filter((link) => link.claim.status === 'rejected' || link.claim.evidences.length < 1)
    );

    if (invalid.length > 0) {
      return reply.code(409).send({ error: 'GR3_VIOLATION', message: 'export only supports non-rejected claims with evidence >=1' });
    }

    const exportVersion = await prisma.exportVersion.create({
      data: {
        status,
        variantLinks: {
          create: variantIds.map((variantId) => ({
            variant: { connect: { id: variantId } }
          }))
        }
      },
      include: {
        variantLinks: true
      }
    });

    return reply.code(201).send(exportVersion);
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: 'INTERNAL_ERROR' });
  }
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof z.ZodError) {
    return reply.code(400).send({ error: 'INVALID_PAYLOAD', issues: error.issues });
  }

  app.log.error(error);
  return reply.code(500).send({ error: 'INTERNAL_ERROR' });
});

const start = async () => {
  await app.listen({ host: '0.0.0.0', port });
};

start().catch((error) => {
  app.log.error(error);
  process.exit(1);
});
