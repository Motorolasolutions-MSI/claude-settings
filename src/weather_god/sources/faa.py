"""FAA ASWS airport-status adapter."""

from __future__ import annotations

from typing import Any, Iterable

from weather_god.config import FAA_STATUS_URL
from weather_god.mock_data import load_mock
from weather_god.models import Disruption
from weather_god.sources.base import SourceStatus, safe_get


def _classify(status: dict[str, Any]) -> tuple[int, str]:
    """Return (severity_1_5, kind_label) for an FAA status block."""
    kind = str(status.get("Type") or "").lower()
    delay = int(status.get("AvgDelayMinutes") or 0)
    closure_begin = status.get("ClosureBegin")
    if closure_begin or "closure" in kind:
        return 5, "closure"
    if "ground stop" in kind:
        return 4, "ground_stop"
    if delay > 45:
        return 3, "major_delay"
    if delay > 15:
        return 2, "minor_delay"
    return 1, "normal"


def _from_statuses(statuses: dict[str, dict[str, Any]], source_label: str) -> list[Disruption]:
    out: list[Disruption] = []
    for iata, entry in statuses.items():
        status = entry.get("Status") or {}
        severity, _ = _classify(status)
        if severity <= 1:
            continue  # normal operations, no disruption emitted
        out.append(
            Disruption(
                source=source_label,
                kind="airport_ops",
                severity=severity,
                headline=str(status.get("Reason") or "Airport operations disrupted"),
                area=iata,
                delay_minutes=int(status.get("AvgDelayMinutes") or 0),
                starts=str(status.get("ClosureBegin") or ""),
                ends=str(status.get("ClosureEnd") or ""),
            )
        )
    return out


def fetch(
    iatas: Iterable[str],
    mock: bool = False,
    timeout: float | None = None,
) -> tuple[list[Disruption], SourceStatus]:
    """Return (disruptions, status). Only disrupted airports are emitted."""
    if mock:
        payload = load_mock("faa_status")
        return _from_statuses(payload.get("statuses", {}), "mock-faa"), SourceStatus(
            "faa", used_mock=True, reason="forced --mock"
        )

    # Live: one request per airport. Any network failure -> mock fallback.
    statuses: dict[str, dict[str, Any]] = {}
    any_success = False
    kwargs = {"timeout": timeout} if timeout else {}
    for iata in iatas:
        payload = safe_get(FAA_STATUS_URL.format(iata=iata), **kwargs)  # type: ignore[arg-type]
        if payload is None:
            continue
        any_success = True
        status = payload.get("Status") or {}
        statuses[iata] = {"Status": status}

    if not any_success:
        mock_payload = load_mock("faa_status")
        return _from_statuses(mock_payload.get("statuses", {}), "mock-faa"), SourceStatus(
            "faa", used_mock=True, reason="live fetch failed"
        )

    return _from_statuses(statuses, "faa"), SourceStatus("faa", used_mock=False)
