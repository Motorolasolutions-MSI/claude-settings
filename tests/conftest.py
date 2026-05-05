"""Shared pytest fixtures."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

# Ensure src/ is on sys.path so `import weather_god` works even without editable install
REPO_ROOT = Path(__file__).resolve().parent.parent
SRC = REPO_ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from weather_god.models import Airport, Coord, Disruption, Lane  # noqa: E402


@pytest.fixture
def suez_lane() -> Lane:
    return Lane(
        id="suez",
        name="Suez Canal",
        chokepoints=(Coord(30.58, 32.27),),
        bbox=(29.5, 31.0, 32.0, 33.5),
        affected_regions=("Egypt", "Red Sea", "Suez"),
        nearby_airports=("CAI", "DXB"),
    )


@pytest.fixture
def jfk_airport() -> Airport:
    return Airport(
        iata="JFK",
        name="John F. Kennedy Intl",
        city="New York",
        country="US",
        coord=Coord(40.64, -73.78),
        region="NA-East",
    )


@pytest.fixture
def severe_weather() -> Disruption:
    return Disruption(
        source="mock-noaa",
        kind="weather",
        severity=4,
        headline="Severe dust storm, Gulf of Suez",
        area="Red Sea; Suez",
    )


@pytest.fixture
def extreme_weather() -> Disruption:
    return Disruption(
        source="mock-noaa",
        kind="weather",
        severity=5,
        headline="Tropical storm",
        area="Red Sea",
    )


@pytest.fixture
def faa_closure() -> Disruption:
    return Disruption(
        source="mock-faa",
        kind="airport_ops",
        severity=5,
        headline="Temporary closure",
        area="JFK",
        delay_minutes=0,
    )


@pytest.fixture
def faa_minor_delay() -> Disruption:
    return Disruption(
        source="mock-faa",
        kind="airport_ops",
        severity=2,
        headline="Minor delays",
        area="JFK",
        delay_minutes=25,
    )


@pytest.fixture
def geo_event() -> Disruption:
    return Disruption(
        source="mock-gdelt",
        kind="geopolitical",
        severity=4,
        headline="Red Sea shipping reroutes amid renewed tensions",
        area="Red Sea",
        tone=-6.0,
    )
