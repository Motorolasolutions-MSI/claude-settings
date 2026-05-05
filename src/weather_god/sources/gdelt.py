"""GDELT 2.0 DOC API adapter for geopolitical news."""

from __future__ import annotations

from typing import Any, Iterable

from weather_god.config import GDELT_DOC_URL
from weather_god.mock_data import load_mock
from weather_god.models import Disruption
from weather_god.sources.base import SourceStatus, safe_get

# Regions we actively query GDELT for (keyword search).
DEFAULT_QUERIES = (
    "Suez",
    "Panama Canal",
    "Malacca",
    "Bab-el-Mandeb",
    "Red Sea shipping",
    "English Channel",
    "port strike",
)


def _tone_to_severity(tone: float) -> int:
    """Map GDELT tone (negative=bad) to severity 1..5."""
    if tone <= -8:
        return 5
    if tone <= -5:
        return 4
    if tone <= -2:
        return 3
    if tone < 0:
        return 2
    return 1


def _parse_articles(articles: list[dict[str, Any]], source_label: str) -> list[Disruption]:
    out: list[Disruption] = []
    for a in articles:
        tone = float(a.get("tone", 0.0))
        out.append(
            Disruption(
                source=source_label,
                kind="geopolitical",
                severity=_tone_to_severity(tone),
                headline=str(a.get("title") or "News event"),
                area=str(a.get("region_tag") or a.get("domain") or ""),
                url=str(a.get("url") or ""),
                starts=str(a.get("seendate") or ""),
                tone=tone,
            )
        )
    return out


def fetch(
    queries: Iterable[str] = DEFAULT_QUERIES,
    mock: bool = False,
    timeout: float | None = None,
) -> tuple[list[Disruption], SourceStatus]:
    """Return (disruptions, status)."""
    if mock:
        payload = load_mock("gdelt_events")
        return _parse_articles(payload.get("articles", []), "mock-gdelt"), SourceStatus(
            "gdelt", used_mock=True, reason="forced --mock"
        )

    kwargs = {"timeout": timeout} if timeout else {}
    collected: list[dict[str, Any]] = []
    any_success = False
    for q in queries:
        params = {
            "query": f"{q} sourcelang:eng",
            "mode": "artlist",
            "format": "json",
            "maxrecords": 10,
            "timespan": "24h",
        }
        payload = safe_get(GDELT_DOC_URL, params=params, **kwargs)  # type: ignore[arg-type]
        if payload is None:
            continue
        any_success = True
        for art in payload.get("articles") or []:
            collected.append(
                {
                    "title": art.get("title", ""),
                    "url": art.get("url", ""),
                    "seendate": art.get("seendate", ""),
                    "tone": float(art.get("tone", 0.0) or 0.0),
                    "region_tag": q,
                }
            )

    if not any_success:
        mock_payload = load_mock("gdelt_events")
        return _parse_articles(mock_payload.get("articles", []), "mock-gdelt"), SourceStatus(
            "gdelt", used_mock=True, reason="live fetch failed"
        )
    if not collected:
        mock_payload = load_mock("gdelt_events")
        return _parse_articles(mock_payload.get("articles", []), "mock-gdelt"), SourceStatus(
            "gdelt", used_mock=True, reason="empty live response"
        )
    return _parse_articles(collected, "gdelt"), SourceStatus("gdelt", used_mock=False)
