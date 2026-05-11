# Ruflo Workflows and Recipes

Common patterns for using Ruflo with Claude Code in real projects.

## Table of Contents

- [Code Review Swarm](#code-review-swarm)
- [Research and Analysis](#research-and-analysis)
- [Test-Driven Development](#test-driven-development)
- [Memory-Powered Context](#memory-powered-context)
- [Security Auditing](#security-auditing)
- [Multi-Model Routing](#multi-model-routing)

---

## Code Review Swarm

Use a coordinated swarm to review code changes from multiple perspectives.

### Setup

```bash
npx ruflo agent spawn reviewer --count 3
npx ruflo swarm coordinate --topology hierarchical
```

### In Claude Code

```
> Use Ruflo to review the last 5 commits. Spawn agents for:
  security review, performance analysis, and code quality.
  Aggregate findings into a single report.
```

### What happens

1. A **queen agent** (Tactical) decomposes the review task
2. Three **worker agents** (Reviewer type) each focus on their domain
3. Results are aggregated via majority consensus
4. A unified report is produced with prioritized findings

---

## Research and Analysis

Spawn researcher agents to explore topics and synthesize findings.

### In Claude Code

```
> Use Ruflo to research best practices for database connection
  pooling in Node.js. Store findings in memory for future reference.
```

### CLI equivalent

```bash
npx ruflo task run "Research Node.js connection pooling best practices"
npx ruflo memory search "connection pooling"
```

---

## Test-Driven Development

Use Ruflo's TDD workflow with coordinated test and implementation agents.

### In Claude Code

```
> Use Ruflo to implement the UserService with TDD:
  1. Spawn a tester agent to write failing tests first
  2. Spawn a coder agent to make tests pass
  3. Spawn a reviewer to verify quality
```

### How the agents coordinate

| Phase | Agent | Action |
|-------|-------|--------|
| Red | Tester | Writes failing test cases |
| Green | Coder | Implements minimum code to pass |
| Refactor | Reviewer | Suggests improvements |

The swarm manager ensures agents work sequentially through each phase.

---

## Memory-Powered Context

Use Ruflo's vector memory to maintain context across sessions.

### Storing decisions

```bash
# Via CLI
npx ruflo memory store "We chose JWT for API auth because..."

# Or in Claude Code
> Store in Ruflo memory: We decided to use PostgreSQL for the
  user service because of its JSONB support and transaction guarantees.
```

### Retrieving context

```bash
npx ruflo memory search "database choice"
npx ruflo memory search "authentication approach"
```

### Memory configuration

```bash
# Set retention period
claude-flow config set memory.retention 90d

# Set max storage
claude-flow config set memory.maxSize 2GB

# Choose vector provider
claude-flow config set memory.vectorProvider hnsw  # local
# or
claude-flow config set memory.vectorProvider pinecone  # cloud
```

---

## Security Auditing

Run automated security analysis using specialized agents.

### In Claude Code

```
> Use Ruflo to audit this project for security vulnerabilities.
  Check for: SQL injection, XSS, command injection, path traversal,
  and dependency vulnerabilities.
```

### CLI approach

```bash
npx ruflo agent spawn security-analyst
npx ruflo task run "Audit codebase for OWASP Top 10 vulnerabilities"
```

### Built-in security features

Ruflo includes automatic protections that are always active:

- **Prompt injection blocking** — Detects and blocks injection attempts in agent inputs
- **PII detection** — Flags personally identifiable information before it's processed
- **Input validation** — Validates all inputs at system boundaries
- **Path traversal prevention** — Blocks file access outside allowed directories

---

## Multi-Model Routing

Ruflo's three-tier routing automatically selects the right model for each task.

### How it works

| Task complexity | Engine | Latency | Example |
|----------------|--------|---------|---------|
| Simple transforms | WASM (Agent Booster) | <1ms | Rename variable, add types |
| Medium tasks | Haiku | ~500ms | Write a unit test, summarize code |
| Complex reasoning | Sonnet/Opus | 2-5s | Architecture design, multi-file refactor |

### Override routing

```bash
# Force a specific tier
npx ruflo task run --tier full "Design the microservices architecture"
npx ruflo task run --tier fast "Add TypeScript types to utils.js"
```

### In Claude Code

```
> Use Ruflo to process these tasks with appropriate model routing:
  - Rename `getUserData` to `fetchUserProfile` across the codebase (fast)
  - Design a caching strategy for the API layer (full)
```

---

## Tips

- **Start small**: Begin with single-agent tasks before scaling to swarms
- **Use memory**: Store architectural decisions and context early — it compounds over time
- **Check hive status**: Run `claude-flow hive status` to monitor agent health
- **Set security level**: Use `strict` mode in production, `moderate` for development
- **Review agent output**: Always review agent-generated code before committing
