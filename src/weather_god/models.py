"""Dataclass models for Weather God."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Coord:
    lat: float
    lon: float

    def to_dict(self) -> dict[str, float]:
        return {"lat": self.lat, "lon": self.lon}


@dataclass(frozen=True)
class Lane:
    id: str
    name: str
    chokepoints: tuple[Coord, ...]
    bbox: tuple[float, float, float, float]  # (lat_min, lon_min, lat_max, lon_max)
    affected_regions: tuple[str, ...]
    nearby_airports: tuple[str, ...]

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "chokepoints": [c.to_dict() for c in self.chokepoints],
            "bbox": list(self.bbox),
            "affected_regions": list(self.affected_regions),
            "nearby_airports": list(self.nearby_airports),
        }


@dataclass(frozen=True)
class Airport:
    iata: str
    name: str
    city: str
    country: str
    coord: Coord
    region: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "iata": self.iata,
            "name": self.name,
            "city": self.city,
            "country": self.country,
            "coord": self.coord.to_dict(),
            "region": self.region,
        }


@dataclass(frozen=True)
class Disruption:
    """A single disruption event tagged to a lane or airport.

    `source` is one of: noaa, faa, gdelt, mock-noaa, mock-faa, mock-gdelt.
    `kind` is a human-readable category like "weather", "airport_ops",
    "geopolitical".
    `severity` is normalized 1-5 where 5 is most severe.
    """

    source: str
    kind: str
    severity: int
    headline: str
    area: str
    url: str = ""
    starts: str = ""
    ends: str = ""
    tone: float | None = None  # GDELT tone, if applicable
    delay_minutes: int | None = None  # FAA, if applicable

    def to_dict(self) -> dict[str, Any]:
        d = {
            "source": self.source,
            "kind": self.kind,
            "severity": self.severity,
            "headline": self.headline,
            "area": self.area,
            "url": self.url,
            "starts": self.starts,
            "ends": self.ends,
        }
        if self.tone is not None:
            d["tone"] = self.tone
        if self.delay_minutes is not None:
            d["delay_minutes"] = self.delay_minutes
        return d


@dataclass
class LaneReport:
    lane: Lane
    disruptions: list[Disruption] = field(default_factory=list)
    score: int = 0
    delay_label: str = "0 days"
    delay_low_days: int = 0
    delay_high_days: int = 0
    factors: dict[str, int] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "lane": self.lane.to_dict(),
            "score": self.score,
            "delay": {
                "label": self.delay_label,
                "low_days": self.delay_low_days,
                "high_days": self.delay_high_days,
            },
            "factors": dict(self.factors),
            "disruptions": [d.to_dict() for d in self.disruptions],
        }


@dataclass
class AirportReport:
    airport: Airport
    disruptions: list[Disruption] = field(default_factory=list)
    status_label: str = "Normal"
    avg_delay_minutes: int = 0
    score: int = 0
    delay_label: str = "0 days"
    delay_low_days: int = 0
    delay_high_days: int = 0
    factors: dict[str, int] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "airport": self.airport.to_dict(),
            "status": self.status_label,
            "avg_delay_minutes": self.avg_delay_minutes,
            "score": self.score,
            "delay": {
                "label": self.delay_label,
                "low_days": self.delay_low_days,
                "high_days": self.delay_high_days,
            },
            "factors": dict(self.factors),
            "disruptions": [d.to_dict() for d in self.disruptions],
        }


@dataclass
class GlobalReport:
    generated_at: str
    mode: str  # "live", "mock", or "live (N sources degraded → mock)"
    lanes: list[LaneReport] = field(default_factory=list)
    airports: list[AirportReport] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "generated_at": self.generated_at,
            "mode": self.mode,
            "lanes": [lr.to_dict() for lr in self.lanes],
            "airports": [ar.to_dict() for ar in self.airports],
        }
