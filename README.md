⚡ ATOMIC SWARM GODS v1.6.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-18%2B-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org)
[![Enterprise Ready](https://img.shields.io/badge/Enterprise-Ready-purple)](https://github.com/SolanaRemix/node)
[![Emoji Triggers](https://github.com/SolanaRemix/node/actions/workflows/emoji-triggers.yml/badge.svg)](https://github.com/SolanaRemix/node/actions/workflows/emoji-triggers.yml)
[![Elite AI Agent](https://github.com/SolanaRemix/node/actions/workflows/elite-ai-agent.yml/badge.svg)](https://github.com/SolanaRemix/node/actions/workflows/elite-ai-agent.yml)

---

## 🚀 Universal Auto-Repair System for Any Language

**Atomic Swarm Gods** is an enterprise-grade, self-healing CI/CD system that automatically repairs any repository in any language. Powered by AI agents, real-time WebSocket dashboards, and autonomous GitHub workflows.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏥 Surgery Dashboard](#-surgery-dashboard)
- [🚀 Quick Start](#-quick-start)
- [🎯 Emoji Commands](#-emoji-commands)
- [🌐 Multi-Language Support](#-multi-language-support)
- [🏢 Enterprise Workflows](#-enterprise-workflows)
- [📦 Setup Guide](#-setup-guide)
- [🔧 Repair Any Repository](#-repair-any-repository)
- [🤖 AI Oracle Memory](#-ai-oracle-memory)
- [💻 Development](#-development)
- [📊 API Reference](#-api-reference)
- [🔍 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌐 **Multi-Language Support** | Node.js, Python, Rust, Go, Java, Solidity, C/C++ |
| 🤖 **AI-Powered Oracle Memory** | Learns from past repairs, suggests fixes |
| 💬 **Emoji Triggers** | `@repair`, `@clean`, `@lock`, `@build`, `@test` |
| 🏥 **Surgery Dashboard** | Real-time WebSocket control plane |
| 📊 **Auto-Changelog** | Automatic documentation generation |
| 🔧 **Zero-Config** | Works on any repository automatically |
| 🦀 **WASM Integration** | WebAssembly module validation |
| 🔄 **Self-Healing Workflows** | Auto-repairs common CI/CD issues |

---

## 🏥 Surgery Dashboard

The **Enterprise Control Plane** provides real-time visibility into all repair operations.

### Access the Dashboard

```bash
# Start the server
node server.js

# Open your browser to
http://localhost:3001
```

### Dashboard Features

| Section | Description |
|---------|-------------|
| **Live Terminal** | Real-time WebSocket logs of all surgeries |
| **Surgery Intake** | One-click repair for any GitHub repository |
| **Active Repairs** | Current running operations with progress |
| **Recent History** | Complete audit log of all surgeries |
| **Oracle Memory Stats** | AI learning metrics and pattern recognition |

---

## 🚀 Quick Start

### One-Command Setup

```bash
# Clone and run
git clone https://github.com/SolanaRemix/node.git
cd node

# Run the deployment pipeline
.\pipeline.ps1          # Windows
./pipeline.sh           # Linux/Mac

# Or manually
npm install
npm run build
node server.js
```

### Docker Deployment

```bash
# Build Docker image
docker build -t atomic-gods:latest .

# Run container
docker run -p 3001:3001 atomic-gods:latest
```

---

## 🎯 Emoji Commands

Trigger autonomous repairs directly from Pull Request comments:

| Command | Action | Example |
|---------|--------|---------|
| 🚀 `@repair` | Full autonomous repair | `@repair fix build issues` |
| 🧹 `@clean` | Clean entropy + reinstall | `@clean node_modules` |
| 🔒 `@lock` | Frozen lockfile install | `@lock regenerate` |
| 📦 `@build` | Build verification | `@build production` |
| ✅ `@test` | Run test suite | `@test all` |
| 📖 `@docs` | Refresh documentation | `@docs update` |
| 📝 `@changelog` | Update changelog | `@changelog add` |

### Advanced Combinations

```bash
# Full repair sequence
@repair --clean --lock --build --test --docs --changelog

# WASM-specific repair
@repair --wasm --strict

# Quick fix
@clean && @lock && @build
```

---

## 🌐 Multi-Language Support

Atomic Swarm Gods automatically detects and repairs projects in any language:

| Language | Detection | Auto-Fix Actions |
|----------|-----------|------------------|
| **Node.js/TypeScript** | `package.json` | `npm install`, `prettier --write`, `eslint --fix`, `tsc` |
| **Python** | `requirements.txt`, `pyproject.toml` | `pip install`, `black`, `isort`, `pytest` |
| **Rust** | `Cargo.toml` | `cargo build`, `cargo fmt`, `cargo clippy --fix` |
| **Go** | `go.mod` | `go mod tidy`, `go fmt ./...`, `go test` |
| **Solidity** | `foundry.toml`, `hardhat.config.js` | `forge fmt`, `prettier --write contracts/**/*.sol` |
| **Java/Kotlin** | `pom.xml`, `build.gradle` | `mvn formatter:format`, `gradle spotlessApply` |
| **C/C++** | `CMakeLists.txt`, `Makefile` | `clang-format -i **/*.cpp **/*.h` |

---

## 🏢 Enterprise Workflows

### Production Workflow (`emoji-triggers.yml`)

| Trigger | Action |
|---------|--------|
| **Push to main** | Full CI/CD pipeline |
| **Pull Request** | Auto-repair on demand |
| **Daily schedule** | Health checks every 6 hours |
| **@repair comment** | Immediate autonomous repair |

### Elite AI Agent (`elite-ai-agent.yml`)

- Runs every 4 hours automatically
- Learns from past repairs via Oracle Memory
- Creates issues when failures are detected
- Auto-commits fixes to PR branches

### Universal Auto-Repair (`universal-repair.yml`)

- Detects language automatically
- Applies language-specific fixes
- Works on any repository without configuration

### Auto-Changelog (`auto-changelog.yml`)

- Generates changelog from commit history
- Updates automatically on push
- Categorizes by feat/fix/docs/refactor

---

## 📦 Setup Guide

### 1. Add Workflows to Your Repository

```bash
# Copy workflows from atomic-node
mkdir -p .github/workflows
cp node/.github/workflows/*.yml .github/workflows/
git add .github/workflows/
git commit -m "chore: Add Atomic Node repair workflows"
git push
```

### 2. Configure Package.json

```json
{
  "scripts": {
    "build": "tsc",
    "test": "node --test",
    "typecheck": "tsc --noEmit --strict",
    "repair": "npm run clean && npm install && npm run build && npm run typecheck",
    "clean": "rm -rf node_modules dist package-lock.json"
  }
}
```

### 3. Set Up TypeScript

```bash
npm install -D typescript @types/node
npx tsc --init
# Enable strict mode in tsconfig.json
```

### 4. Configure GitHub Secrets (Optional)

```bash
# For automated PR comments and updates
gh secret set GITHUB_TOKEN --body "your-token"
```

---

## 🔧 Repair Any Repository

### Method 1: GitHub Actions (Recommended)

```yaml
# .github/workflows/repair.yml
name: "Quick Repair"
on:
  workflow_dispatch:
    inputs:
      repair_type:
        description: 'Repair type'
        required: true
        default: 'full'
        type: choice
        options: [full, clean, build, test]

jobs:
  repair:
    uses: SolanaRemix/node/.github/workflows/emoji-triggers.yml@main
    with:
      repair_type: ${{ inputs.repair_type }}
    secrets: inherit
```

### Method 2: GitHub API

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/owner/repo/actions/workflows/repair.yml/dispatches \
  -d '{"ref":"main","inputs":{"repair_type":"full"}}'
```

### Method 3: Local Surgery Dashboard

```bash
node server.js
# Open http://localhost:3001
# Enter any GitHub URL and click "Start AI Surgery"
```

---

## 🤖 AI Oracle Memory

The Oracle Memory system learns from every repair and improves over time.

### Features

- **Persistent Storage** - Saves all repairs to `oracle-memory.json`
- **Pattern Recognition** - Identifies recurring issues
- **Confidence Scoring** - Rates fix reliability
- **Auto-Suggestions** - Recommends fixes based on history
- **Memory Pruning** - Maintains 10,000 most relevant records

### API

```typescript
import { oracleMemory } from './src/brain/oracle-memory.js';

// Learn from a repair
oracleMemory.learn(repo, language, issue, fix, success);

// Get suggestions for a repository
const suggestions = oracleMemory.suggest(repo, language);

// Get memory statistics
const stats = oracleMemory.stats();
```

---

## 💻 Development

### Project Structure

```
atomic-node/
├── .github/workflows/          # CI/CD pipelines
│   ├── emoji-triggers.yml      # PR comment commands
│   ├── elite-ai-agent.yml      # Scheduled AI repairs
│   ├── universal-repair.yml    # Multi-language auto-repair
│   └── auto-changelog.yml      # Auto-documentation
├── src/brain/                  # Oracle Memory AI
│   └── oracle-memory.ts        # Learning system
├── docs/dashboard/             # Web UI
│   └── index.html              # Enterprise control plane
├── scripts/
│   ├── local-test.ps1          # Windows test script
│   └── local-test.sh           # Unix test script
├── server.js                   # Surgery server
├── pipeline.ps1                # Deployment pipeline
├── package.json
├── tsconfig.json
└── README.md
```

### Local Development

```bash
# Windows PowerShell
.\local-test.ps1                # Full test suite
npm run repair                  # Full repair cycle
npm run typecheck               # TypeScript validation
npm run build                   # Build project
npm test                        # Run tests
npm start                       # Run application

# Linux/Mac
./local-test.sh                 # Full test suite
pnpm repair                     # Full repair cycle
```

### Adding New Repair Scripts

```typescript
// src/repairers/custom.repairer.ts
import { BaseRepairer } from '../base';

export class CustomRepairer extends BaseRepairer {
  async repair(): Promise<boolean> {
    console.log('🔧 Running custom repair...');
    // Add your repair logic here
    return true;
  }
}
```

---

## 📊 API Reference

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health check |
| `/api/surgery/records` | GET | All surgery records |
| `/api/surgery/start` | POST | Start new surgery |
| `/api/surgery/clone` | POST | Clone repository |
| `/api/surgery/step` | POST | Execute repair step |
| `/api/surgery/autofix` | POST | Run auto-fix |
| `/api/surgery/commit` | POST | Commit changes |
| `/api/surgery/create-pr` | POST | Create pull request |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connected` | Server → Client | Connection established |
| `repair-update` | Server → Client | Step progress update |
| `repair-complete` | Server → Client | Surgery completed |

---

## 🔍 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **PNPM symlink errors (Windows)** | Use `npm install` instead |
| **Workflow not triggering** | Check branch name in workflow file |
| **Badge shows "no status"** | Run workflow at least once |
| **TypeScript errors** | Run `npm run typecheck` locally |
| **Tests failing** | Check test files in `dist/` |
| **Port 3001 in use** | `npx kill-port 3001` |

### Debug Mode

```bash
# Enable debug logging
export DEBUG=atomic-node:*
npm run repair

# Windows PowerShell
$env:DEBUG="atomic-node:*"
npm run repair
```

### Getting Help

- 📧 Email: support@solanaremix.io
- 💬 Discord: https://discord.gg/solanaremix
- 🐛 Issues: https://github.com/SolanaRemix/node/issues

---

## 🤝 Contributing

### Development Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

### Commit Convention

| Type | Description |
|------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | Formatting |
| `refactor:` | Code restructuring |
| `test:` | Testing |
| `chore:` | Maintenance |

### Code Review Checklist

- [ ] Tests pass locally
- [ ] TypeScript strict mode passes
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Error handling implemented

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built with ❤️ by the SolanaRemix Team

- **SolanaRemix** - Lead Architect
- **SMSDAO** - Infrastructure
- **Copilot** - AI Assistant
- **github-actions[bot]** - Automation

---

## 📞 Contact

| Channel | Link |
|---------|------|
| **Report Bug** | [GitHub Issues](https://github.com/SolanaRemix/node/issues) |
| **Request Feature** | [GitHub Issues](https://github.com/SolanaRemix/node/issues) |
| **Discord** | [Join Server](https://discord.gg/solanaremix) |
| **Email** | support@solanaremix.io |

---

<div align="center">

**⚡ ATOMIC SWARM GODS v1.6.0 — DEPLOY READY!**

*Last Updated: 2026-05-28*
*Status: 🟢 Production Ready*

</div>
