# Phase 0 Inventory

## Repository Graph (Current)
- Runtime: `server.js`
- Core class runtime: `src/index.ts`
- Domain modules: `src/agents`, `src/auditor`, `src/enterprise`, `src/brain`, `src/auto-pr`, `src/monitoring`
- CI workflows: `.github/workflows/*.yml`
- UI assets: `public/*`, `surgery-room/*`

## Dependency Graph
`package.json` dependencies:
- `express`
- `cors`
- `socket.io`

`devDependencies`:
- `@commitlint/cli`
- `@commitlint/config-conventional`

## API Graph
Single-process API is defined in `server.js`; all routes are local handlers with in-memory state and filesystem persistence.

## Workflow Graph
Multiple overlapping workflows perform similar auto-repair behaviors (`atomic-prod`, `repair-any`, `universal-repair`, `emoji-triggers`, `elite-ai-agent`, `atomic-self-healing`).

## Duplicate/Dead/Risk Findings
1. Duplicate runtime backups:
   - `server.js.backup`
   - `server.js.backup2`
   - `server.js.backup-final`
   - `server.js.backup-024417`
2. Duplicate/legacy implementations:
   - `src/auditor/DynamicShiftDetector.ts`
   - `src/auditor/DynamicShiftDetector.ts.broken`
3. Workflow overlap and conflicting behavior risk:
   - Multiple workflows commit/push changes automatically
   - Different repair logic in `repair-any.yml`, `atomic-prod.yml`, `universal-repair.yml`, `emoji-triggers.yml`
4. Test harness instability:
   - `test.sh` exits early under `set -e` due arithmetic increment behavior.
5. Security risks:
   - Force-push in automation paths
   - Broad write permissions in multiple workflows

## Circular Imports
- No direct TypeScript circular import chain detected in `src/**/*.ts` imports.

## Immediate V2 Priorities
- Consolidate orchestration primitives (event bus + service registry)
- Add typed contracts and policy engine
- Introduce plugin manifest validation and loader
- Add staged validation workflow dedicated to V2 foundation
