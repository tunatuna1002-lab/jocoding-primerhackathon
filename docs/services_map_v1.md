# Services Map v1

- users-svc
  - owns users data
  - db: users_db
- inputs-svc
  - owns raw inputs and intake metadata
  - db: inputs_db
- core-svc
  - owns claims / evidence / provenance and all outputs
  - db: core_db

All services expose:
- `GET /health`
- service specific CRUD-like minimal endpoints
