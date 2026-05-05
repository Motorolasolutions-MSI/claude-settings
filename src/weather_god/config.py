"""Configuration constants: endpoints, weights, scoring bands."""

from __future__ import annotations

from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PACKAGE_ROOT = Path(__file__).resolve().parent
REPO_ROOT = PACKAGE_ROOT.parent.parent  # src/weather_god -> src -> repo
DATA_DIR = REPO_ROOT / "data"
MOCK_DIR = DATA_DIR / "mock"

LANES_FILE = DATA_DIR / "lanes.json"
AIRPORTS_FILE = DATA_DIR / "airports.json"

# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------
USER_AGENT = "weather-god/0.1 (github.com/sambloomberg-sketch/claude-settings)"
DEFAULT_TIMEOUT = 8.0

NOAA_ALERTS_URL = "https://api.weather.gov/alerts/active?status=actual"
FAA_STATUS_URL = "https://soa.smext.faa.gov/asws/api/airport/status/{iata}"
GDELT_DOC_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------
WEIGHTS = {
    "weather": 0.45,
    "airport_ops": 0.25,
    "geopolitical": 0.30,
}

# NWS severity label -> internal severity 1..5
NWS_SEVERITY = {
    "Extreme": 5,
    "Severe": 4,
    "Moderate": 3,
    "Minor": 2,
    "Unknown": 1,
}

# Delay bands keyed by inclusive upper bound of score
DELAY_BANDS = [
    (19, "0 days", 0, 0),
    (39, "+0–1 days", 0, 1),
    (59, "+1–3 days", 1, 3),
    (79, "+3–7 days", 3, 7),
    (100, "+7–14 days", 7, 14),
]
