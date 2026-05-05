"""Seed data schema tests."""

from __future__ import annotations

from weather_god.seed import load_airports, load_lanes


def test_lanes_load_and_have_required_fields():
    lanes = load_lanes()
    assert len(lanes) >= 5
    ids = {l.id for l in lanes}
    # Spot-check critical chokepoints
    for expected in ("suez", "panama", "malacca", "bab_el_mandeb"):
        assert expected in ids, f"missing lane id: {expected}"

    for l in lanes:
        assert l.id and l.name
        assert len(l.chokepoints) >= 1
        assert len(l.bbox) == 4
        lat_min, lon_min, lat_max, lon_max = l.bbox
        assert -90 <= lat_min <= lat_max <= 90
        assert -180 <= lon_min <= lon_max <= 180
        assert len(l.affected_regions) >= 1
        assert len(l.nearby_airports) >= 1
        for c in l.chokepoints:
            assert -90 <= c.lat <= 90
            assert -180 <= c.lon <= 180


def test_airports_load_and_have_required_fields():
    airports = load_airports()
    assert len(airports) >= 5
    iatas = {a.iata for a in airports}
    for expected in ("JFK", "LHR", "SIN", "DXB"):
        assert expected in iatas, f"missing airport: {expected}"

    for a in airports:
        assert len(a.iata) == 3
        assert a.name and a.city and a.country
        assert -90 <= a.coord.lat <= 90
        assert -180 <= a.coord.lon <= 180
        assert a.region
