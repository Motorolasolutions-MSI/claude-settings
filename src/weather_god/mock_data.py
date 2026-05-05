"""Offline fixtures loader for sources."""

from __future__ import annotations

import json
from typing import Any

from weather_god.config import MOCK_DIR


def load_mock(name: str) -> dict[str, Any]:
    """Load data/mock/<name>.json."""
    path = MOCK_DIR / f"{name}.json"
    return json.loads(path.read_text())
