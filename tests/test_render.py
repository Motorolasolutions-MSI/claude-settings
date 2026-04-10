"""Tests for markdown and JSON renderers."""

from __future__ import annotations

import json

from weather_god.models import GlobalReport
from weather_god.render import render_json, render_markdown
from weather_god.scoring import build_airport_report, build_lane_report


def _make_report(lane_reports, airport_reports) -> GlobalReport:
    return GlobalReport(
        generated_at="2026-04-10T12:00:00Z",
        mode="mock",
        lanes=lane_reports,
        airports=airport_reports,
    )


class TestMarkdown:
    def test_contains_header(self):
        md = render_markdown(_make_report([], []))
        assert "Weather God" in md
        assert "Generated: 2026-04-10T12:00:00Z" in md
        assert "Mode: mock" in md

    def test_lane_section(self, suez_lane, severe_weather):
        lr = build_lane_report(suez_lane, [severe_weather])
        md = render_markdown(_make_report([lr], []))
        assert "Suez Canal" in md
        assert "Risk" in md
        assert "Factors:" in md
        assert "weather" in md
        assert "Severe dust storm" in md

    def test_airport_section(self, jfk_airport, faa_closure):
        ar = build_airport_report(jfk_airport, [faa_closure])
        md = render_markdown(_make_report([], [ar]))
        assert "JFK" in md
        assert "Temporary closure" in md

    def test_lanes_only_hides_airports(self, suez_lane, jfk_airport, severe_weather, faa_closure):
        lr = build_lane_report(suez_lane, [severe_weather])
        ar = build_airport_report(jfk_airport, [faa_closure])
        md = render_markdown(_make_report([lr], [ar]), include_airports=False)
        assert "Suez Canal" in md
        assert "JFK" not in md

    def test_empty_lane_list(self):
        md = render_markdown(_make_report([], []))
        assert "_No lanes in report._" in md


class TestJson:
    def test_valid_json(self, suez_lane, severe_weather):
        lr = build_lane_report(suez_lane, [severe_weather])
        payload = render_json(_make_report([lr], []))
        parsed = json.loads(payload)
        assert parsed["mode"] == "mock"
        assert len(parsed["lanes"]) == 1
        lane = parsed["lanes"][0]
        assert lane["lane"]["name"] == "Suez Canal"
        assert 0 <= lane["score"] <= 100
        assert "factors" in lane
        assert "delay" in lane
        assert "label" in lane["delay"]
        assert "low_days" in lane["delay"]
        assert "high_days" in lane["delay"]

    def test_airport_shape(self, jfk_airport, faa_closure):
        ar = build_airport_report(jfk_airport, [faa_closure])
        parsed = json.loads(render_json(_make_report([], [ar])))
        airport = parsed["airports"][0]
        assert airport["airport"]["iata"] == "JFK"
        assert airport["status"]
        assert 0 <= airport["score"] <= 100
        assert airport["factors"]["airport_ops"] == 100
