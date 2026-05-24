# 🚀 SolanaRemix Node Repair System

This repository contains **dual workflows** for deterministic Node.js repair:

- **Atomic Node Repair (Prod)** → Runs on `main` branch, covers Node.js **20.x + 22.x**.
- **Agentic Swarm WASM Repair (Dev)** → Runs on `dev` + feature branches, covers Node.js **18.x → 24.x**.

Both workflows enforce:
- 🧹 Entropy cleanup (`node_modules`, lockfiles)
- 🔒 Frozen lockfile installs (no drift)
- 📦 Deterministic builds
- ✅ Test suite execution
- 📖 Docs refresh (`docs/` folder auto‑generated)
- 📝 Changelog updates (auto‑updated after each new version)

---

## 🎯 Elite CLI Commands & Comment Triggers

You can trigger workflows via **emoji commands** in PRs/issues:

- 🚀 `@repair` → Run Atomic Node Repair
- 🧹 `@clean` → Clean entropy (remove node_modules + lockfiles)
- 🔒 `@lock` → Enforce frozen lockfile install
- 📦 `@build` → Verify build
- ✅ `@test` → Run test suite
- 📖 `@docs` → Refresh docs folder
- 📝 `@changelog` → Update changelog automatically

---

## 🔑 Node.js Version Coverage

- **Production (Atomic)** → Node.js **20.x + 22.x**
- **Development (Swarm)** → Node.js **18.x → 24.x**

---

## 📜 Governance

- Same triggers preserved (`push`, `pull_request`, `schedule`).
- No logic changes, no repo breakage.
- Outdated dependencies handled safely with frozen installs.
- Docs + changelog refreshed automatically to ensure transparency.
