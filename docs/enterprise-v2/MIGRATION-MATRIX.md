# V1 → V2 Migration Matrix

| V1 Module | V2 Destination | Action | Compatibility |
|---|---|---|---|
| `server.js` | `apps/api` + `services/*` | Keep + extract gradually | V1 routes preserved during migration |
| `src/index.ts` | `services/repair-engine` + orchestrator flows | Split responsibilities | Adapter maps legacy task model |
| `src/enterprise/EliteRepairValidator.ts` | `services/repair-engine` + `packages/security` | Split validation and policy | Existing validator remains callable |
| `src/auditor/*` | `services/repair-engine` + `packages/shared/contracts` | Keep and progressively normalize | Event topic compatibility |
| `src/auto-pr/repair-pr.ts` | `services/deployment-engine` + workflow bridge | Keep + rehome deployment/PR orchestration | Legacy trigger compatibility |
| `src/brain/oracle-memory.ts` | `services/ai-engine` | Keep + integrate provider routing | Existing memory model retained |
| `blockchain/*` | `services/ledger-engine` | Keep chain data, unify write path | Existing API export still supported |
| `.github/workflows/emoji-triggers.yml` | unchanged + V2 validation gate | Preserve | Full command compatibility |

## Adapter Strategy
- Use `services/adapters/v1-server-adapter.js` to map V1 request shape to V2 task contracts.
- Keep V1 endpoints active while internally dispatching tasks through orchestrator.
