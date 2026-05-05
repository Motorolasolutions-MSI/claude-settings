"""Seed data loader: turns data/*.json into model instances."""

from __future__ import annotations

import json

from weather_god.config import AIRPORTS_FILE, LANES_FILE
from weather_god.models import Airport, Coord, Lane


def load_lanes() -> list[Lane]:
    raw = json.loads(LANES_FILE.read_text())
    lanes: list[Lane] = []
    for entry in raw:
        chokepoints = tuple(
            Coord(lat=c["lat"], lon=c["lon"]) for c in entry["chokepoints"]
        )
        bbox = tuple(entry["bbox"])  # type: ignore[assignment]
        if len(bbox) != 4:
            raise ValueError(f"lane {entry.get('id')} has invalid bbox: {bbox!r}")
        lanes.append(
            Lane(
                id=entry["id"],
                name=entry["name"],
                chokepoints=chokepoints,
                bbox=bbox,  # type: ignore[arg-type]
                affected_regions=tuple(entry["affected_regions"]),
                nearby_airports=tuple(entry["nearby_airports"]),
            )
        )
    return lanes


def load_airports() -> list[Airport]:
    raw = json.loads(AIRPORTS_FILE.read_text())
    airports: list[Airport] = []
    for entry in raw:
        coord = Coord(lat=entry["coord"]["lat"], lon=entry["coord"]["lon"])
        airports.append(
            Airport(
                iata=entry["iata"],
                name=entry["name"],
                city=entry["city"],
                country=entry["country"],
                coord=coord,
                region=entry["region"],
            )
        )
    return airports
