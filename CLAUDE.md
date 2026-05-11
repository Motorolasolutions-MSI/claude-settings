# CLAUDE.md — claude-settings

This repository serves a dual purpose: it is both a centralized Claude Code configuration store for the `sambloomberg-sketch` organization **and** the home of the `weather-god` Python CLI — a global transit-risk report tool for logistics and supply-chain planners.

## Repository Structure

```
claude-settings/
├── CLAUDE.md                  # Project conventions and AI assistant guidance
├── README.md                  # Weather God user-facing docs
├── pyproject.toml             # Python package metadata for Weather God
├── .claude/settings.json      # Project-level Claude Code config (permissions, hooks)
├── .devcontainer/             # Dev container spec
├── data/                      # Static airports/lanes seed data + offline mock fixtures
├── src/weather_god/           # Weather God CLI source
└── tests/                     # Pytest suite (runs without network)
```

## Weather God app

The repo also hosts **Weather God**, a Python CLI that produces a global
transit-risk report. Full usage is in `README.md`. Quick reference:

```bash
pip install -e ".[dev]"   # install in editable mode with test deps
weather-god --mock        # offline run with bundled fixtures
weather-god --mock --json # machine-readable output
pytest -q                 # full test suite, no network required
```

Python 3.10+ required. The dev container's `postCreateCommand` runs the install
automatically.

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

### Code style

- `from __future__ import annotations` at the top of every module
- Prefer clarity over cleverness; follow existing patterns
- No unnecessary abstractions or speculative features
- Pure functions (no side effects) for scoring and rendering — keep I/O at the edges
- Use `safe_get()` from `sources/base.py` for all outbound HTTP — it never raises

### Configuration files

- All tunable constants belong in `config.py`; never hardcode URLs or weights inline
- Data files (`lanes.json`, `airports.json`) use plain JSON with no trailing commas
- Validate config changes by running `weather-god --mock` before committing

### CLAUDE.md files

When writing or updating `CLAUDE.md` files (for this or other repos):

- Start with the repository's actual purpose
- Document real structure — update as files are added/removed
- Include working install, run, and test commands
- Note architectural decisions and non-obvious conventions
- Keep instructions actionable and concise
