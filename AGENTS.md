# Repository Rules

1. Keep npm workspaces active. Internal package dependencies must stay `workspace:*`.
2. Never replace `workspace:*` with `file:*` or `link:*`.
3. Run `node scripts/doctor_npm_runtime.mjs` before install/debugging workspace failures.
4. Run `node scripts/check_workspace_protocol.mjs` in CI to prevent dependency protocol regression.
5. Preserve core invariants:
- GR-1 Variant links >=1 Claim.
- GR-2 verified/rejected Claim links >=1 Evidence.
- GR-3 export includes only grounded Variants.
6. Preserve DB-per-service. No cross-DB access.
