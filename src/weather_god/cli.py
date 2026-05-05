"""CLI entry point for Weather God."""

from __future__ import annotations

import argparse
import logging
import sys
from datetime import datetime, timezone

from weather_god.models import Disruption, GlobalReport
from weather_god.render import render_json, render_markdown
from weather_god.scoring import build_airport_report, build_lane_report
from weather_god.seed import load_airports, load_lanes
from weather_god.sources import faa, gdelt, noaa


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="weather-god",
        description=(
            "Global transit-risk report combining weather, airport ops, "
            "and geopolitical disruptions."
        ),
    )
    p.add_argument("--json", action="store_true", help="Emit JSON instead of markdown")
    p.add_argument(
        "--lanes-only", action="store_true", help="Only report on shipping lanes"
    )
    p.add_argument(
        "--airports-only", action="store_true", help="Only report on airports"
    )
    p.add_argument(
        "--region",
        metavar="SUBSTR",
        default=None,
        help="Case-insensitive substring filter on lane affected_regions / airport region",
    )
    p.add_argument(
        "--mock", action="store_true", help="Force use of bundled offline fixtures"
    )
    p.add_argument(
        "--timeout",
        type=float,
        default=None,
        help="Per-request HTTP timeout in seconds",
    )
    p.add_argument(
        "-v", "--verbose", action="store_true", help="Verbose logging to stderr"
    )
    return p


def _filter_lanes(lanes, region: str | None):
    if not region:
        return lanes
    needle = region.lower()
    return [
        l for l in lanes if any(needle in r.lower() for r in l.affected_regions)
    ]


def _filter_airports(airports, region: str | None):
    if not region:
        return airports
    needle = region.lower()
    return [
        a
        for a in airports
        if needle in a.region.lower()
        or needle in a.country.lower()
        or needle in a.city.lower()
    ]


def _mode_label(source_statuses: list) -> str:
    mocked = [s for s in source_statuses if s.used_mock]
    if len(mocked) == len(source_statuses):
        return "mock"
    if not mocked:
        return "live"
    return f"live ({len(mocked)} source{'s' if len(mocked) != 1 else ''} degraded → mock)"


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
        stream=sys.stderr,
    )

    if args.lanes_only and args.airports_only:
        print("error: --lanes-only and --airports-only are mutually exclusive", file=sys.stderr)
        return 2

    lanes = _filter_lanes(load_lanes(), args.region)
    airports = _filter_airports(load_airports(), args.region)

    monitored_iatas = {a.iata for a in airports}
    # Also monitor IATAs referenced by lanes so lane-adjacent disruptions apply
    for l in lanes:
        monitored_iatas.update(l.nearby_airports)

    # Fetch each source (each handles its own fallback).
    all_disruptions: list[Disruption] = []
    statuses = []

    noaa_disruptions, noaa_status = noaa.fetch(mock=args.mock, timeout=args.timeout)
    all_disruptions.extend(noaa_disruptions)
    statuses.append(noaa_status)

    faa_disruptions, faa_status = faa.fetch(
        sorted(monitored_iatas), mock=args.mock, timeout=args.timeout
    )
    all_disruptions.extend(faa_disruptions)
    statuses.append(faa_status)

    gdelt_disruptions, gdelt_status = gdelt.fetch(mock=args.mock, timeout=args.timeout)
    all_disruptions.extend(gdelt_disruptions)
    statuses.append(gdelt_status)

    lane_reports = [build_lane_report(l, all_disruptions) for l in lanes]
    airport_reports = [build_airport_report(a, all_disruptions) for a in airports]

    report = GlobalReport(
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        mode=_mode_label(statuses),
        lanes=lane_reports if not args.airports_only else [],
        airports=airport_reports if not args.lanes_only else [],
    )

    if args.json:
        sys.stdout.write(render_json(report) + "\n")
    else:
        sys.stdout.write(
            render_markdown(
                report,
                include_lanes=not args.airports_only,
                include_airports=not args.lanes_only,
            )
        )
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
