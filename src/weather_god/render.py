"""Report renderers: markdown and JSON."""

from __future__ import annotations

import json

from weather_god.models import AirportReport, GlobalReport, LaneReport


def render_json(report: GlobalReport, indent: int | None = 2) -> str:
    return json.dumps(report.to_dict(), indent=indent, sort_keys=False)


def _format_factors(factors: dict[str, int]) -> str:
    return " | ".join(f"{k} {v}" for k, v in factors.items())


def _render_lane(lr: LaneReport) -> list[str]:
    lines: list[str] = []
    lines.append(
        f"### {lr.lane.name}  —  Risk {lr.score}/100  —  Delay {lr.delay_label}"
    )
    lines.append(f"Factors: {_format_factors(lr.factors)}")
    if lr.disruptions:
        for d in lr.disruptions:
            lines.append(f"- [{d.source}] {d.headline}")
    else:
        lines.append("- No active disruptions.")
    lines.append("")
    return lines


def _render_airport(ar: AirportReport) -> list[str]:
    lines: list[str] = []
    lines.append(
        f"### {ar.airport.iata} — {ar.airport.name}  —  Risk {ar.score}/100  —  Delay {ar.delay_label}"
    )
    status = ar.status_label
    if ar.avg_delay_minutes:
        status = f"{status} (avg {ar.avg_delay_minutes} min)"
    lines.append(f"Status: {status}")
    lines.append(f"Factors: {_format_factors(ar.factors)}")
    if ar.disruptions:
        for d in ar.disruptions:
            lines.append(f"- [{d.source}] {d.headline}")
    else:
        lines.append("- No active disruptions.")
    lines.append("")
    return lines


def render_markdown(
    report: GlobalReport,
    *,
    include_lanes: bool = True,
    include_airports: bool = True,
) -> str:
    lines: list[str] = []
    lines.append("# Weather God — Global Transit Risk Report")
    lines.append(f"Generated: {report.generated_at}   Mode: {report.mode}")
    lines.append("")

    if include_lanes:
        lines.append("## Shipping Lanes")
        lines.append("")
        if not report.lanes:
            lines.append("_No lanes in report._")
            lines.append("")
        else:
            # Highest risk first
            for lr in sorted(report.lanes, key=lambda l: l.score, reverse=True):
                lines.extend(_render_lane(lr))

    if include_airports:
        lines.append("## Airports")
        lines.append("")
        if not report.airports:
            lines.append("_No airports in report._")
            lines.append("")
        else:
            for ar in sorted(report.airports, key=lambda a: a.score, reverse=True):
                lines.extend(_render_airport(ar))

    return "\n".join(lines).rstrip() + "\n"
