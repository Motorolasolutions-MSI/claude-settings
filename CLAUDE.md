# CLAUDE.md — claude-settings

This repository serves a dual purpose: it is both a centralized Claude Code configuration store for the `sambloomberg-sketch` organization **and** the home of the `weather-god` Python CLI — a global transit-risk report tool for logistics and supply-chain planners.

## Repository Structure

```
claude-settings/
├── CLAUDE.md                         # This file — project conventions and AI assistant guidance
├── README.md                         # User-facing docs for weather-god CLI
├── pyproject.toml                    # Python package definition (weather-god)
├── .devcontainer/devcontainer.json   # Dev container config (universal:2 image)
├── data/
│   ├── airports.json                 # Monitored airport definitions
│   ├── lanes.json                    # Shipping lane definitions
│   └── mock/
│       ├── faa_status.json           # Offline fixture for FAA source
│       ├── gdelt_events.json         # Offline fixture for GDELT source
│       └── noaa_alerts.json          # Offline fixture for NOAA source
├── src/weather_god/
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py                        # Argparse entry point, orchestrates fetch + render
│   ├── config.py                     # All constants: URLs, weights, delay bands, paths
│   ├── mock_data.py                  # Mock fixture loader
│   ├── models.py                     # Frozen dataclasses: Lane, Airport, Disruption, reports
│   ├── render.py                     # Markdown and JSON output formatters
│   ├── scoring.py                    # Pure scoring functions (no I/O)
│   ├── seed.py                       # Loads lanes.json / airports.json into model objects
│   └── sources/
│       ├── __init__.py
│       ├── base.py                   # safe_get() helper + SourceStatus
│       ├── faa.py                    # FAA ASWS adapter
│       ├── gdelt.py                  # GDELT 2.0 doc adapter
│       └── noaa.py                   # NOAA/NWS alerts adapter
└── tests/
    ├── conftest.py                   # Shared fixtures (Lane, Airport, Disruption instances)
    ├── test_cli.py
    ├── test_render.py
    ├── test_scoring.py
    ├── test_seed.py
    └── test_sources_mock.py
```

## Install & Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"        # includes pytest + pytest-mock

# Live report (falls back to mock if a source is unreachable)
weather-god

# Fully offline / deterministic
weather-god --mock

# JSON output
weather-god --mock --json | python -m json.tool

# Filter by region or category
weather-god --lanes-only --region "Red Sea"
weather-god --airports-only
```

## Tests

```bash
pytest -q           # all tests, no network access required
```

All tests run without network access. Fixtures live in `tests/conftest.py`.

## Architecture

### Data flow

```
seed.py (lanes.json / airports.json)
    → cli.py fetches each source in sequence
        sources/{noaa,faa,gdelt}.py  →  list[Disruption] + SourceStatus
    → scoring.py tags disruptions to lanes/airports, computes risk scores
    → render.py formats GlobalReport as markdown or JSON
```

### Key design decisions

- **Sources are independent**: each returns `(list[Disruption], SourceStatus)` and handles its own mock fallback — the CLI never crashes if a source fails.
- **Scoring is pure**: `scoring.py` has no I/O and is fully unit-testable.
- **All constants in `config.py`**: weights, delay bands, API endpoints, paths. Never hardcode these elsewhere.
- **Frozen dataclasses** for `Lane`, `Airport`, `Disruption` — they are value objects passed through the pipeline unchanged.

### Scoring

```
WEIGHTS = {"weather": 0.45, "airport_ops": 0.25, "geopolitical": 0.30}
```

| Score  | Delay band  |
|--------|-------------|
| 0–19   | 0 days      |
| 20–39  | +0–1 days   |
| 40–59  | +1–3 days   |
| 60–79  | +3–7 days   |
| 80–100 | +7–14 days  |

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
