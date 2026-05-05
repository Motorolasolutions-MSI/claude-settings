"""End-to-end CLI smoke tests using --mock so no network is touched."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def _run(args: list[str]) -> subprocess.CompletedProcess:
    env = {"PYTHONPATH": str(REPO_ROOT / "src"), "PATH": "/usr/bin:/bin:/usr/local/bin"}
    return subprocess.run(
        [sys.executable, "-m", "weather_god", *args],
        capture_output=True,
        text=True,
        env=env,
        cwd=str(REPO_ROOT),
        timeout=30,
    )


def test_mock_markdown():
    result = _run(["--mock"])
    assert result.returncode == 0, result.stderr
    assert "Weather God" in result.stdout
    assert "Shipping Lanes" in result.stdout
    assert "Airports" in result.stdout
    assert "Mode: mock" in result.stdout


def test_mock_json_is_valid():
    result = _run(["--mock", "--json"])
    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    assert payload["mode"] == "mock"
    assert isinstance(payload["lanes"], list)
    assert isinstance(payload["airports"], list)
    assert len(payload["lanes"]) > 0
    assert len(payload["airports"]) > 0

    for lane in payload["lanes"]:
        assert 0 <= lane["score"] <= 100
        assert lane["delay"]["label"]
        assert "factors" in lane

    for airport in payload["airports"]:
        assert 0 <= airport["score"] <= 100
        assert airport["delay"]["label"]


def test_lanes_only():
    result = _run(["--mock", "--lanes-only"])
    assert result.returncode == 0
    assert "Shipping Lanes" in result.stdout
    assert "## Airports" not in result.stdout


def test_airports_only():
    result = _run(["--mock", "--airports-only"])
    assert result.returncode == 0
    assert "## Airports" in result.stdout
    assert "## Shipping Lanes" not in result.stdout


def test_region_filter():
    result = _run(["--mock", "--region", "Red Sea", "--json"])
    assert result.returncode == 0
    payload = json.loads(result.stdout)
    for lane in payload["lanes"]:
        regions = [r.lower() for r in lane["lane"]["affected_regions"]]
        assert any("red sea" in r for r in regions)


def test_mutually_exclusive_flags_fail():
    result = _run(["--mock", "--lanes-only", "--airports-only"])
    assert result.returncode != 0
    assert "mutually exclusive" in result.stderr


def test_mock_touches_no_network(monkeypatch=None):
    """Run --mock with a bogus proxy to guarantee no network is used."""
    import os

    env = {
        "PYTHONPATH": str(REPO_ROOT / "src"),
        "PATH": "/usr/bin:/bin:/usr/local/bin",
        "HTTPS_PROXY": "http://127.0.0.1:1",
        "HTTP_PROXY": "http://127.0.0.1:1",
        "NO_PROXY": "",
    }
    env.update({k: v for k, v in os.environ.items() if k in ("HOME",)})
    result = subprocess.run(
        [sys.executable, "-m", "weather_god", "--mock", "--json"],
        capture_output=True,
        text=True,
        env=env,
        cwd=str(REPO_ROOT),
        timeout=30,
    )
    assert result.returncode == 0, result.stderr
    json.loads(result.stdout)  # still valid
