"""NOAA / NWS active-alerts adapter."""

from __future__ import annotations

from typing import Any

from weather_god.config import NOAA_ALERTS_URL, NWS_SEVERITY
from weather_god.mock_data import load_mock
from weather_god.models import Disruption
from weather_god.sources.base import SourceStatus, safe_get


def _parse_features(features: list[dict[str, Any]], source_label: str) -> list[Disruption]:
    out: list[Disruption] = []
    for f in features:
        props = f.get("properties") or {}
        severity = NWS_SEVERITY.get(str(props.get("severity", "Unknown")), 1)
        out.append(
            Disruption(
                source=source_label,
                kind="weather",
                severity=severity,
                headline=str(props.get("headline") or props.get("event") or "Weather alert"),
                area=str(props.get("areaDesc") or ""),
                url=str(props.get("url") or ""),
                starts=str(props.get("effective") or ""),
                ends=str(props.get("expires") or ""),
            )
        )
    return out


def fetch(mock: bool = False, timeout: float | None = None) -> tuple[list[Disruption], SourceStatus]:
    """Return (disruptions, status)."""
    if mock:
        payload = load_mock("noaa_alerts")
        return _parse_features(payload.get("features", []), "mock-noaa"), SourceStatus(
            "noaa", used_mock=True, reason="forced --mock"
        )

    kwargs = {"timeout": timeout} if timeout else {}
    payload = safe_get(NOAA_ALERTS_URL, **kwargs)  # type: ignore[arg-type]
    if payload is None:
        mock_payload = load_mock("noaa_alerts")
        return _parse_features(mock_payload.get("features", []), "mock-noaa"), SourceStatus(
            "noaa", used_mock=True, reason="live fetch failed"
        )

    features = payload.get("features") or []
    disruptions = _parse_features(features, "noaa")
    if not disruptions:
        mock_payload = load_mock("noaa_alerts")
        return _parse_features(mock_payload.get("features", []), "mock-noaa"), SourceStatus(
            "noaa", used_mock=True, reason="empty live response"
        )
    return disruptions, SourceStatus("noaa", used_mock=False)
