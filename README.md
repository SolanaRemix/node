# 🚀 Atomic Node - Universal Workflow Repair System

[![Atomic Node Repair](https://github.com/SolanaRemix/node/actions/workflows/atomic-prod.yml/badge.svg)](https://github.com/SolanaRemix/node/actions/workflows/atomic-prod.yml)
[![Swarm WASM Repair](https://github.com/SolanaRemix/node/actions/workflows/swarm-dev.yml/badge.svg)](https://github.com/SolanaRemix/node/actions/workflows/swarm-dev.yml)

## 🎯 Overview

Atomic Node provides **self-healing CI/CD workflows** for the SolanaRemix organization. It ensures deterministic builds, automatic entropy cleanup, and multi-version Node.js compatibility.

## 📋 Features

### Production Workflow (Atomic Node Repair)
- ✅ Node.js 20.x + 22.x support
- 🧹 Automatic entropy cleanup
- 🔒 Frozen lockfile enforcement
- 📖 Auto-documentation refresh
- 📝 Changelog management

### Development Workflow (Swarm WASM Repair)
- 🌐 Node.js 18.x → 24.x matrix testing
- 🦀 WASM module validation
- 🔒 TypeScript strict mode
- 💬 PR comment commands

## 🚀 Quick Start

### Local Development (Windows PowerShell)

```powershell
# Run local tests
.\local-test.ps1

# Or step by step
pnpm install          # Install dependencies
pnpm run typecheck    # Type check
pnpm run build        # Build project
pnpm run test         # Run tests
pnpm run start        # Run the application
Local Development (Linux/Mac)
bash
# Run local tests
chmod +x local-test.sh
./local-test.sh

# Or step by step
pnpm install
pnpm run typecheck
pnpm run build
pnpm run test
pnpm start
🎯 Emoji Commands (PRs & Issues)
CommandAction
🚀 @repairFull atomic repair
🧹 @cleanClean entropy
🔒 @lockFrozen lockfile install
📦 @buildVerify build
✅ @testRun test suite
📖 @docsRefresh docs
📝 @changelogUpdate changelog
🔧 CI/CD Workflows
Atomic Production (.github/workflows/atomic-prod.yml)
Runs on: main branch, daily schedule

Tests: Node 20.x, 22.x

Actions: Clean → Install → Build → Test → Docs → Changelog

Swarm Development (.github/workflows/swarm-dev.yml)
Runs on: dev, feature/* branches

Tests: Node 18.x → 24.x

Actions: Multi-version alignment → WASM validation → Build → Test

📁 Project Structure
text
.
├── .github/
│   ├── workflows/
│   │   ├── atomic-prod.yml      # Production CI/CD
│   │   ├── swarm-dev.yml        # Development CI/CD
│   │   └── emoji-triggers.yml   # PR comment commands
│   └── actions/
│       └── setup-node-pnpm/     # Shared action
├── src/
│   ├── index.ts                 # Main application
│   └── index.test.ts            # Tests
├── dist/                        # Compiled output
├── package.json
├── tsconfig.json
└── README.md
🧪 Testing Locally
Run the full test suite locally:

powershell
# Windows PowerShell
.\local-test.ps1
bash
# Linux/Mac
./local-test.sh
📊 Status
All workflows are designed to be self-repairing - they will automatically:

Clean corrupted node_modules

Regenerate lockfiles if missing

Fix TypeScript configuration issues

Update documentation on changes

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing)

Open a Pull Request

📄 License
MIT License - see LICENSE file for details
