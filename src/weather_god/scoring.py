"""Risk scoring and delay estimation.

Pure functions — no I/O, no network. Unit-testable.
"""

from __future__ import annotations

from weather_god.config import DELAY_BANDS, WEIGHTS
from weather_god.models import Airport, AirportReport, Disruption, Lane, LaneReport


# ---------------------------------------------------------------------------
# Category subscores
# ---------------------------------------------------------------------------


def weather_subscore(disruptions: list[Disruption]) -> int:
    total = sum(d.severity * 20 for d in disruptions if d.kind == "weather")
    return min(100, total)


def airport_ops_subscore(disruptions: list[Disruption]) -> int:
    if not any(d.kind == "airport_ops" for d in disruptions):
        return 0
    worst = 0
    for d in disruptions:
        if d.kind != "airport_ops":
            continue
        if d.severity >= 5:
            worst = max(worst, 100)
        elif d.severity >= 4:
            worst = max(worst, 80)
        elif d.severity >= 3:
            worst = max(worst, 60)
        elif d.severity >= 2:
            worst = max(worst, 30)
    return worst


def _tone_bucket(tone: float) -> int:
    """Map negative tone to bucket 0..5 (5 = most negative)."""
    if tone >= 0:
        return 0
    if tone > -2:
        return 1
    if tone > -5:
        return 2
    if tone > -8:
        return 3
    if tone > -10:
        return 4
    return 5


def geopolitical_subscore(disruptions: list[Disruption]) -> int:
    geo = [d for d in disruptions if d.kind == "geopolitical"]
    if not geo:
        return 0
    event_count = len(geo)
    avg_bucket = sum(_tone_bucket(d.tone or 0.0) for d in geo) / event_count
    return int(min(100, 15 * event_count + 10 * avg_bucket))


# ---------------------------------------------------------------------------
# Combine
# ---------------------------------------------------------------------------


def combined_score(disruptions: list[Disruption]) -> tuple[int, dict[str, int]]:
    factors = {
        "weather": weather_subscore(disruptions),
        "airport_ops": airport_ops_subscore(disruptions),
        "geopolitical": geopolitical_subscore(disruptions),
    }
    score = round(sum(WEIGHTS[k] * factors[k] for k in factors))
    score = max(0, min(100, score))
    return score, factors


def delay_band(score: int) -> tuple[str, int, int]:
    """Return (label, low_days, high_days) for a score in [0, 100]."""
    score = max(0, min(100, score))
    for upper, label, low, high in DELAY_BANDS:
        if score <= upper:
            return label, low, high
    # unreachable because last band has upper=100
    label, low, high = DELAY_BANDS[-1][1], DELAY_BANDS[-1][2], DELAY_BANDS[-1][3]
    return label, low, high


# ---------------------------------------------------------------------------
# Disruption tagging
# ---------------------------------------------------------------------------


def _region_matches(disruption_area: str, regions: tuple[str, ...]) -> bool:
    if not disruption_area:
        return False
    area_lower = disruption_area.lower()
    return any(r.lower() in area_lower for r in regions)


def tag_lane_disruptions(lane: Lane, all_disruptions: list[Disruption]) -> list[Disruption]:
    """Return disruptions that apply to this lane."""
    out: list[Disruption] = []
    for d in all_disruptions:
        if d.kind == "weather":
            if _region_matches(d.area, lane.affected_regions):
                out.append(d)
        elif d.kind == "geopolitical":
            if _region_matches(d.area, lane.affected_regions):
                out.append(d)
        elif d.kind == "airport_ops":
            if d.area in lane.nearby_airports:
                out.append(d)
    return out


def tag_airport_disruptions(
    airport: Airport, all_disruptions: list[Disruption]
) -> list[Disruption]:
    out: list[Disruption] = []
    for d in all_disruptions:
        if d.kind == "airport_ops":
            if d.area == airport.iata:
                out.append(d)
        elif d.kind == "weather":
            # Heuristic: match on city, country, or region substring.
            hay = d.area.lower()
            if (
                airport.city.lower() in hay
                or airport.country.lower() in hay
                or airport.region.lower() in hay
            ):
                out.append(d)
        elif d.kind == "geopolitical":
            hay = d.area.lower()
            if airport.country.lower() in hay or airport.city.lower() in hay:
                out.append(d)
    return out


# ---------------------------------------------------------------------------
# Report builders
# ---------------------------------------------------------------------------


def build_lane_report(lane: Lane, all_disruptions: list[Disruption]) -> LaneReport:
    tagged = tag_lane_disruptions(lane, all_disruptions)
    score, factors = combined_score(tagged)
    label, low, high = delay_band(score)
    return LaneReport(
        lane=lane,
        disruptions=tagged,
        score=score,
        delay_label=label,
        delay_low_days=low,
        delay_high_days=high,
        factors=factors,
    )


def build_airport_report(
    airport: Airport, all_disruptions: list[Disruption]
) -> AirportReport:
    tagged = tag_airport_disruptions(airport, all_disruptions)
    score, factors = combined_score(tagged)
    label, low, high = delay_band(score)

    status_label = "Normal"
    avg_delay = 0
    ops = [d for d in tagged if d.kind == "airport_ops"]
    if ops:
        worst = max(ops, key=lambda d: d.severity)
        status_label = worst.headline
        avg_delay = worst.delay_minutes or 0

    return AirportReport(
        airport=airport,
        disruptions=tagged,
        status_label=status_label,
        avg_delay_minutes=avg_delay,
        score=score,
        delay_label=label,
        delay_low_days=low,
        delay_high_days=high,
        factors=factors,
    )
