# CLAUDE.md — claude-settings

This repository serves a dual purpose: it is a centralized Claude Code
configuration store for the `Motorolasolutions-MSI` organization **and** the
home of the `weather-god` Python CLI — a global transit-risk report tool for
logistics and supply-chain planners. It also contains `web/LogisticsHub.jsx`,
a standalone React component used as a logistics operations dashboard demo.

## Repository Structure

```
claude-settings/
├── CLAUDE.md                       # Project conventions and AI assistant guidance
├── README.md                       # Weather God user-facing docs
├── pyproject.toml                  # Python package metadata (setuptools)
├── poetry.lock                     # Lockfile (kept for reproducibility; build uses setuptools)
├── .claude/
│   ├── settings.json               # Project-level Claude Code config (permissions, hooks)
│   └── hooks/session-start.sh      # SessionStart hook — installs deps in remote sessions
├── .devcontainer/devcontainer.json # Dev container spec (Python 3.11)
├── data/
│   ├── airports.json               # Seed: monitored airports
│   ├── lanes.json                  # Seed: shipping lanes
│   └── mock/                       # Offline fixtures (faa, gdelt, noaa)
├── src/weather_god/
│   ├── cli.py                      # argparse entry point (`weather-god`)
│   ├── config.py                   # Endpoints, weights, delay bands, paths
│   ├── models.py                   # Dataclasses: Disruption, Lane, Airport, reports
│   ├── scoring.py                  # Pure scoring + delay-band logic
│   ├── render.py                   # Markdown + JSON renderers
│   ├── seed.py                     # Loads lanes/airports from data/*.json
│   ├── mock_data.py                # Mock fixture loader helpers
│   └── sources/{base,noaa,faa,gdelt}.py  # External data sources with mock fallback
├── tests/                          # Pytest suite — runs without network
└── web/LogisticsHub.jsx            # Large React dashboard component (recharts + lucide)
```

## Weather God app

Weather God is a Python CLI producing a global transit-risk report. Full usage
is in `README.md`. Quick reference:

```bash
pip install -e ".[dev]"   # install in editable mode with test deps
weather-god --mock        # offline run with bundled fixtures
weather-god --mock --json # machine-readable output
pytest -q                 # full test suite, no network required
```

Python 3.10+ required (dev container uses 3.11). The dev container's
`postCreateCommand` runs `pip install -e ".[dev]"` automatically; the
`session-start.sh` hook does the same for remote Claude Code sessions
(gated on `CLAUDE_CODE_REMOTE=true`).

## LogisticsHub web component

`web/LogisticsHub.jsx` is a single-file React component (~1450 lines) that
depends on `recharts` and `lucide-react`. It is not wired into a build —
it's a drop-in dashboard meant to be embedded in a host React app. There
is no `package.json`, no bundler, and no tests for it in this repo.

## Development Workflow

- **Branch naming**: `claude/<description>-<id>` (e.g., `claude/add-feature-xYzAb`)
- **Commits**: Descriptive messages explaining the "why"; one logical change per commit
- **Push**: `git push -u origin <branch-name>`
- **PR**: Open a draft PR after pushing; request review before merging to `main`

## Key Conventions

### Adding a new data source

1. Create `src/weather_god/sources/<name>.py` implementing a `fetch(*, mock, timeout)` function that returns `(list[Disruption], SourceStatus)`.
2. Add mock fixture JSON under `data/mock/`.
3. Add endpoint URL / constants to `config.py`.
4. Wire it into `cli.py` alongside the existing sources.
5. Add tests under `tests/test_sources_mock.py` or a new file.

### Code style (Python)

- `from __future__ import annotations` at the top of every module
- Prefer clarity over cleverness; follow existing patterns
- No unnecessary abstractions or speculative features
- Pure functions (no side effects) for scoring and rendering — keep I/O at the edges
- Use `safe_get()` from `sources/base.py` for all outbound HTTP — it never raises

### Configuration files

- All tunable constants belong in `config.py`; never hardcode URLs or weights inline
- Data files (`lanes.json`, `airports.json`) use plain JSON with no trailing commas
- Validate config changes by running `weather-god --mock` before committing

### Claude Code settings

- Project permissions and hooks live in `.claude/settings.json`
- The `SessionStart` hook (`.claude/hooks/session-start.sh`) is a no-op outside
  remote sessions; do not assume it has run locally
- When adding permissions, prefer narrow `Bash(<cmd>:*)` patterns over broad allows

### CLAUDE.md files

When writing or updating `CLAUDE.md` files (for this or other repos):

- Start with the repository's actual purpose
- Document real structure — update as files are added/removed
- Include working install, run, and test commands
- Note architectural decisions and non-obvious conventions
- Keep instructions actionable and concise
