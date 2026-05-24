# 🚀 Node Repair Workflows
![CI](https://github.com/SolanaRemix/node/actions/workflows/ci.yml/badge.svg)
This repository runs **dual CI/CD workflows** to keep production deterministic and development dynamic:

- **🚀 Atomic Node Repair (Prod)**  
  Runs on `main` branch. Covers Node.js **20.x + 22.x**.  
  Always enforces entropy cleanup, frozen installs, build/test verification, docs refresh, and changelog updates.

- **🌐 Agentic Swarm WASM Repair (Dev)**  
  Runs on `dev` + `feature/**` branches. Covers Node.js **18.x → 24.x**.  
  Adds WASM repair logic (strict TypeScript enforcement) and multi‑version alignment.

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

# Atomic Node

Production-grade Node.js + PNPM + WASM infrastructure.

## Stack

- Node.js 22
- PNPM
- TypeScript
- GitHub Actions
- WASM validation

## 📜 Governance

- Same triggers preserved (`push`, `pull_request`, `schedule`).  
- No logic changes, no repo breakage.  
- Outdated dependencies handled safely with frozen installs.  
- Docs + changelog refreshed automatically to ensure transparency.
