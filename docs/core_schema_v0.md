# Core Schema v0

## Entities

- Claim
  - id
  - input_id
  - confidence
  - status
  - timestamps
- Evidence
  - id
  - claim_id
  - source
  - content
- Provenance
  - id
  - claim_id
  - actor_type
  - actor_id
  - action
  - metadata
- Draft
- Section
- Bullet
- Variant
- ExportVersion

## Invariants

- GR-1, GR-2, GR-2-bis, GR-3 are enforced in `core-svc` transactional operations.
