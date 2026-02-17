# SOT v3 (Skeleton of Truth)

- services: users-svc, inputs-svc, core-svc
- DB policy: DB-per-service (no cross-DB direct access)
- transport: REST (Fastify)
- baseline stack: Node.js + TypeScript + Fastify + Prisma(PostgreSQL) + Vitest

## Core governance rules

- GR-1: `Variant(target=bullet)` must reference `claim_ids >= 1`
- GR-2: If claim `status` is `verified` or `rejected`, `Evidence >= 1` is required.
- GR-2-bis: If `Evidence == 0`, only `candidate + low` is allowed.
- GR-3: `ExportVersion` includes only variants whose claims satisfy
  - `claim.status != rejected`
  - `claim.evidences >= 1`
