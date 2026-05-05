# Weather God

A Python CLI that produces a **global transit-risk report** for logistics and
supply-chain planners. It merges three disruption categories into per-route
risk scores and estimated transit-time delay bands:

1. **Weather** affecting major shipping lanes (NOAA / NWS active alerts)
2. **Airport delays and temporary closures** (FAA ASWS)
3. **Geopolitical disruptions** (GDELT 2.0 article search, by region keyword)

Every data source has a mock fallback, so the CLI runs end-to-end with **no API
keys** and without network access when `--mock` is passed.

## Install

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Run

```bash
# Live report — hits public APIs, falls back to mock if a source is unreachable
weather-god

# Fully offline / deterministic
weather-god --mock

# JSON for piping into other tools
weather-god --mock --json | python -m json.tool

# Filter by region or category
weather-god --lanes-only --region "Red Sea"
weather-god --airports-only
```

### Flags

| Flag                | Purpose                                                |
|---------------------|--------------------------------------------------------|
| `--json`            | Emit machine-readable JSON instead of markdown         |
| `--lanes-only`      | Report only on shipping lanes                          |
| `--airports-only`   | Report only on airports                                |
| `--region SUBSTR`   | Case-insensitive substring filter on affected regions  |
| `--mock`            | Force use of bundled offline fixtures                  |
| `--timeout SEC`     | Per-request HTTP timeout (default 8s)                  |

## Scoring

Each lane/airport gets a weighted risk score (0–100) and a delay band:

```
WEIGHTS = {"weather": 0.45, "airport_ops": 0.25, "geopolitical": 0.30}
```

| Score   | Delay        |
|---------|--------------|
| 0–19    | 0 days       |
| 20–39   | +0–1 days    |
| 40–59   | +1–3 days    |
| 60–79   | +3–7 days    |
| 80–100  | +7–14 days   |

See `src/weather_god/scoring.py` for the full weighting logic.

## Sample output

```markdown
# Weather God — Global Transit Risk Report
Generated: 2026-04-10T14:05:00Z   Mode: mock

## Shipping Lanes

### Suez Canal  —  Risk 68/100  —  Delay +3–7 days
Factors: weather 40 | airport_ops 20 | geopolitical 95
- [mock-noaa] Severe dust storm, Gulf of Suez
- [mock-gdelt] "Red Sea shipping reroutes amid renewed tensions"
```

## Tests

```bash
pytest -q
```

All tests run without network access.
