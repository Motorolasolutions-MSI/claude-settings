# Ruflo + Claude Local Setup Guide

Ruflo (formerly Claude Flow) is a multi-agent orchestration platform for Claude Code. It enables deployment of specialized AI agents working in coordinated swarms with self-learning capabilities, distributed memory, and native MCP integration.

> **Note on naming**: The CLI tool and npm packages still use the `claude-flow` name. Commands shown below use `claude-flow` accordingly. The `ruflo` shorthand is available as an alias after installation.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Claude Code Integration](#claude-code-integration)
- [Local Development Setup](#local-development-setup)
- [CLI Reference](#cli-reference)
- [Architecture Overview](#architecture-overview)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Quick Start

Get up and running in under 5 minutes:

```bash
# 1. Set your API key
export ANTHROPIC_API_KEY="your-api-key-here"

# 2. Install Claude Code and Ruflo
npm install -g @anthropic-ai/claude-code
npx ruflo@latest init --wizard

# 3. Register as MCP server in Claude Code
claude mcp add claude-flow npx claude-flow@alpha mcp start

# 4. Verify everything works
claude-flow hive status
```

You now have 310+ MCP tools available inside Claude Code for multi-agent orchestration.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ (LTS recommended) |
| npm | 9+ |
| Claude Code | Latest |
| Anthropic API Key | Required |

Verify your environment:

```bash
node --version    # Must be 18+
npm --version     # Must be 9+
```

## Installation

### Quick Install (Recommended)

```bash
# 1. Install Claude Code
npm install -g @anthropic-ai/claude-code

# 2. Install Ruflo
npx ruflo@latest init --wizard
```

### One-Line Install

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/ruvnet/ruflo@main/scripts/install.sh | bash
```

For a full setup including MCP integration:

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/ruvnet/ruflo@main/scripts/install.sh | bash -s -- --full
```

### NPM Global Install

```bash
npm install -g claude-flow@alpha
claude-flow --version
claude-flow init
```

### Docker Install

```bash
docker pull ruvnet/claude-flow:v2-alpha
docker run -it --name claude-flow \
  -v $(pwd):/workspace \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ruvnet/claude-flow:v2-alpha
```

### Verify Installation

```bash
claude-flow hive status
claude-flow mcp tools list
claude-flow sparc modes
```

## Configuration

### Environment Variables

Set your API keys and preferences:

```bash
# Required
export ANTHROPIC_API_KEY="your-api-key-here"

# Optional provider keys
export OPENAI_API_KEY="your-openai-key"
export GOOGLE_API_KEY="your-google-key"

# Ruflo settings
export RUFLO_MCP_ENABLED=true
export RUFLO_SECURITY_LEVEL=strict        # strict | moderate | permissive
export RUFLO_VECTOR_PROVIDER=hnsw         # hnsw | pinecone | supabase
export RUFLO_LEARNING_ENABLED=true
```

To persist these, add them to your shell profile:

```bash
echo 'export ANTHROPIC_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

### Memory System

Initialize and configure the local memory system:

```bash
claude-flow memory init
claude-flow config set memory.retention 30d
claude-flow config set memory.maxSize 1GB
```

### Hooks

Enable lifecycle hooks for automated workflows:

```bash
claude-flow hooks enable --all
claude-flow hooks set post-edit "prettier --write {file}"
```

### General Configuration

```bash
npx ruflo config set <key> <value>
npx ruflo config get <key>
npx ruflo config validate
```

## Claude Code Integration

### MCP Server Setup

Register Ruflo as an MCP server in Claude Code:

```bash
claude mcp add claude-flow npx claude-flow@alpha mcp start
claude mcp list
```

Once registered, Claude Code gains access to 310+ MCP tools for agent spawning, task routing, memory operations, and more.

### Initialize a Project

```bash
mkdir my-project && cd my-project
claude-flow project init --template full-stack
```

### Using Ruflo Inside Claude Code

With MCP enabled, you can invoke Ruflo tools directly from Claude Code sessions. The platform exposes tools for:

- **Agent spawning and coordination** — Create and manage specialized agents
- **Task routing with model selection** — Intelligent task distribution across agents
- **Memory and knowledge graph operations** — Persistent vector-based memory
- **Security scanning** — Prompt injection blocking, PII detection
- **Session persistence** — Save and restore orchestration state

#### Example: Spawning a research swarm

Inside a Claude Code session, you can ask Claude to use Ruflo tools:

```
> Use Ruflo to spawn a research swarm that analyzes the security
  posture of our API endpoints.
```

Claude Code will call the appropriate MCP tools to:
1. Spawn researcher and analyst agents
2. Coordinate them via the swarm manager
3. Aggregate findings into a structured report

#### Example: Storing and retrieving context

```
> Store a summary of today's architecture decisions in Ruflo memory.
> Later: Search Ruflo memory for our API versioning decisions.
```

This uses the vector-based memory system for persistent knowledge across sessions.

## Local Development Setup

### Clone and Build from Source

```bash
git clone https://github.com/ruvnet/ruflo.git
cd ruflo
npm install
npm run build
npm link
npm test
```

### Development Commands

```bash
npm run dev              # Start development server
npm run test             # Run test suite (London School TDD)
npm run benchmark        # Performance regression testing
```

### Project Structure

```
/src        - Source code
/tests      - Test files
/docs       - Documentation
/config     - Configuration files
/scripts    - Utility scripts
/examples   - Sample code
```

### Key Packages

| Package | Purpose |
|---------|---------|
| `@claude-flow/cli` | CLI entry point (26 commands, 140+ subcommands) |
| `@claude-flow/codex` | Dual-mode Claude + Codex collaboration |
| `@claude-flow/guidance` | Governance control plane |
| `@claude-flow/hooks` | 17 hooks + 12 workers |
| `@claude-flow/memory` | AgentDB + HNSW vector search |
| `@claude-flow/security` | Input validation and CVE remediation |

### Architecture Principles

- **Domain-Driven Design** with bounded contexts
- **Files under 500 lines** - keep modules focused
- **Typed interfaces** throughout
- **Test-Driven Development** (London School)
- **Event sourcing** for state changes
- **Input validation** at system boundaries

## CLI Reference

### Session Management

```bash
npx ruflo session start          # Begin new session
npx ruflo session restore        # Reload previous context
npx ruflo session export         # Save session state
```

### Task Execution

```bash
npx ruflo task run <prompt>      # Execute with intelligent routing
npx ruflo agent spawn <type>     # Create agent instance
npx ruflo swarm coordinate       # Manage multi-agent dynamics
```

### Intelligence and Learning

```bash
npx ruflo hooks intelligence --status    # Check learning system
npx ruflo memory search <query>          # Vector search patterns
npx ruflo skills list                    # List available capabilities
```

## Architecture Overview

### System Layers

| Layer | Purpose |
|-------|---------|
| **User** | CLI and Claude Code interface |
| **Orchestration** | MCP Server, Router, 27 Hooks |
| **Agents** | 100+ specialized worker types |
| **Coordination** | Swarm management with consensus algorithms |
| **Intelligence** | RuVector memory and learning systems |
| **Providers** | Claude, GPT, Gemini, local models |

### Swarm Topology

Ruflo supports hierarchical (queen/worker) and mesh topologies:

- **Queen types**: Strategic, Tactical, Adaptive
- **Worker types**: Researcher, Coder, Analyst, Tester, Architect, Reviewer, Optimizer, Documenter
- **Consensus algorithms**: Majority, Weighted, Byzantine

### Three-Tier Model Routing

| Tier | Engine | Latency | Use Case |
|------|--------|---------|----------|
| Agent Booster | WASM | <1ms | Simple code transforms (var-to-const, add-types) |
| Fast | Haiku | ~500ms | Medium complexity tasks |
| Full | Sonnet/Opus | 2-5s | Complex multi-agent reasoning |

### Performance Targets

- **Agent spawning**: <100ms batch operations
- **Vector search**: <1ms retrieval (HNSW)
- **Consensus decisions**: <500ms (Byzantine agreement)
- **Simple transforms**: <1ms (WASM, no LLM call)

### Security Features

- Prompt injection blocking
- Input validation and path traversal prevention
- Command injection protection
- PII detection
- Multi-agent security consensus

## Troubleshooting

### Common Issues

**Permission errors during install:**
```bash
sudo chown -R $(whoami) ~/.npm
```

**Claude Code not found after install:**
```bash
npm install -g @anthropic-ai/claude-code
```

**Memory system issues:**
```bash
claude-flow memory reset --force
```

**MCP connection problems:**
```bash
claude-flow mcp restart
```

**Cache issues:**
```bash
npm cache clean --force
```

**API key not recognized:**
```bash
# Verify the key is set
echo $ANTHROPIC_API_KEY
# Re-export if needed
export ANTHROPIC_API_KEY="your-key"
# Test connectivity
claude-flow config validate
```

**Agent spawning timeouts:**
```bash
# Increase the spawn timeout (default is 30s)
claude-flow config set agent.spawnTimeout 60000
# Check system resource usage
claude-flow hive status --verbose
```

**Docker container can't access API:**
```bash
# Ensure the API key is passed to the container
docker run -it --name claude-flow \
  -v $(pwd):/workspace \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ruvnet/claude-flow:v2-alpha
```

---

## Resources

- [Ruflo GitHub Repository](https://github.com/ruvnet/ruflo)
- [Ruflo Wiki](https://github.com/ruvnet/ruflo/wiki)
- [Installation Guide](https://github.com/ruvnet/ruflo/wiki/Installation-Guide)
- License: MIT
