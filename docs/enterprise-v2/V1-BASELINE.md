# V1 Baseline Freeze (Source of Truth)

## Runtime Paths
- `/home/runner/work/node/node/server.js` (primary HTTP + WebSocket runtime)
- `/home/runner/work/node/node/src/index.ts` (AtomicRepair core class)
- `/home/runner/work/node/node/src/auditor/*` (audit strategy modules)
- `/home/runner/work/node/node/src/enterprise/EliteRepairValidator.ts`
- `/home/runner/work/node/node/src/auto-pr/repair-pr.ts`
- `/home/runner/work/node/node/src/brain/oracle-memory.ts`

## Existing API Surface (V1)
- `GET /health`
- `GET /metrics`
- `GET /api/blockchain`
- `GET /api/surgery/records`
- `POST /api/surgery/start`
- `POST /api/surgery/clone`
- `POST /api/surgery/elite-repair`
- `POST /api/surgery/commit`
- `POST /api/surgery/create-pr`
- `POST /api/surgery/autofix`
- `GET /`
- `GET /atomic-ledger.html`

## Existing Scripts
From `package.json`:
- `npm start` → `node server.js`
- `npm run dev` → `node --watch server.js`

Standalone scripts:
- `/home/runner/work/node/node/test.sh`
- `/home/runner/work/node/node/test-repair.sh`
- `/home/runner/work/node/node/scripts/auto-heal.js`

## Existing Workflow Surface
Primary CI/CD and automation workflows in `/home/runner/work/node/node/.github/workflows/`:
- `atomic-prod.yml`
- `emoji-triggers.yml`
- `repair-any.yml`
- `universal-repair.yml`
- `elite-security-ci.yml`
- `atomic-self-healing.yml`
- `elite-ai-agent.yml`
- `swarm-dev.yml`
- `release.yml`, `elite-release.yml`, `npm-publish.yml`
- `auto-changelog.yml`, `elite-notify.yml`, `commitlint.yml`

## Freeze Policy
- V1 endpoints remain active while V2 services are introduced.
- V1 entrypoint remains `server.js` until V2 API promotion is complete.
- V1 emoji-trigger behavior is preserved by keeping `emoji-triggers.yml` unchanged.
