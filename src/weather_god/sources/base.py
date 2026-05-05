"""Base helpers for HTTP sources: safe_get and fallback plumbing."""

from __future__ import annotations

import logging
from typing import Any

import requests

from weather_god.config import DEFAULT_TIMEOUT, USER_AGENT

log = logging.getLogger("weather_god.sources")


class SourceStatus:
    """Simple record returned by each adapter so the CLI can show mode."""

    def __init__(self, name: str, used_mock: bool, reason: str = "") -> None:
        self.name = name
        self.used_mock = used_mock
        self.reason = reason

    def __repr__(self) -> str:  # pragma: no cover
        return f"SourceStatus({self.name!r}, used_mock={self.used_mock}, reason={self.reason!r})"


def safe_get(
    url: str,
    *,
    params: dict[str, Any] | None = None,
    timeout: float = DEFAULT_TIMEOUT,
    headers: dict[str, str] | None = None,
) -> dict[str, Any] | None:
    """HTTP GET that never raises. Returns parsed JSON, or None on any failure."""
    merged_headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    if headers:
        merged_headers.update(headers)

    try:
        resp = requests.get(url, params=params, timeout=timeout, headers=merged_headers)
    except requests.RequestException as e:
        log.warning("HTTP error for %s: %s", url, e)
        return None

    if resp.status_code != 200:
        log.warning("Non-200 (%d) from %s", resp.status_code, url)
        return None

    try:
        return resp.json()
    except ValueError as e:
        log.warning("Invalid JSON from %s: %s", url, e)
        return None
