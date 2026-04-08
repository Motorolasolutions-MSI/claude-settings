# Ruflo Quickstart Guide

A minimal guide to get Ruflo running with Claude Code in under 5 minutes.

## 1. Prerequisites

- Node.js 18+ and npm 9+
- An [Anthropic API key](https://console.anthropic.com/)

## 2. Install

```bash
npm install -g @anthropic-ai/claude-code
npx ruflo@latest init --wizard
```

## 3. Configure

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Add this to your `~/.bashrc` or `~/.zshrc` to persist it.

## 4. Connect to Claude Code

Register Ruflo as an MCP server so Claude Code can use its tools:

```bash
claude mcp add claude-flow npx claude-flow@alpha mcp start
```

Verify the connection:

```bash
claude mcp list
claude-flow hive status
```

## 5. Try It Out

Start a Claude Code session and try these prompts:

| Prompt | What happens |
|--------|-------------|
| "Spawn a researcher agent to analyze this codebase" | Creates a specialized agent that reads and summarizes your code |
| "Create a swarm to refactor the auth module" | Spawns coordinated agents (architect, coder, reviewer) |
| "Store this decision in memory" | Persists context to vector memory for future retrieval |
| "Search memory for our API design decisions" | Retrieves relevant past context via vector search |

## 6. Next Steps

- Read the full [Local Setup Guide](ruflo-claude-local.md) for detailed configuration
- See [Workflows and Recipes](ruflo-workflows.md) for common usage patterns
- Visit the [Ruflo GitHub Repository](https://github.com/ruvnet/ruflo) for source code and issues
