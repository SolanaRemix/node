# Enterprise V2 Migration Guide

## Stage 1: Foundation (Completed in this change)
- Added `apps/`, `packages/`, and `services/` boundaries.
- Added shared runtime config, event bus, service registry, contracts.
- Added security policy engine and plugin manifest/loader core.
- Added initial orchestrator + domain service engines.

## Stage 2: Internal Routing
- Route new work through orchestrator (`task.scheduled`) while keeping V1 endpoints.
- Use adapter mapping for legacy payload shape.

## Stage 3: API Consolidation
- Move business logic from `server.js` handlers into service `execute()` paths.
- Keep response shape compatibility until clients are migrated.

## Stage 4: Workflow Consolidation
- Keep emoji-trigger workflow active.
- Use V2 validation workflow for staged gates and security checks.

## Rollback
- V1 runtime remains untouched as rollback target (`server.js`).
- V2 modules are additive; disable by avoiding V2 startup path.
