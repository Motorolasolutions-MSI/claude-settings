"""Tests for source adapters: mock forcing and network fallback."""

from __future__ import annotations

import pytest

from weather_god.sources import base, faa, gdelt, noaa


class TestNoaaMock:
    def test_forced_mock_returns_disruptions(self):
        disruptions, status = noaa.fetch(mock=True)
        assert status.used_mock is True
        assert status.name == "noaa"
        assert len(disruptions) > 0
        assert all(d.source == "mock-noaa" for d in disruptions)
        assert all(d.kind == "weather" for d in disruptions)

    def test_fallback_when_network_fails(self, monkeypatch):
        monkeypatch.setattr(base, "safe_get", lambda *a, **kw: None)
        # reload-free: noaa.fetch calls base.safe_get through its imported name
        monkeypatch.setattr(noaa, "safe_get", lambda *a, **kw: None)
        disruptions, status = noaa.fetch(mock=False)
        assert status.used_mock is True
        assert status.reason == "live fetch failed"
        assert all(d.source == "mock-noaa" for d in disruptions)

    def test_fallback_when_empty_response(self, monkeypatch):
        monkeypatch.setattr(noaa, "safe_get", lambda *a, **kw: {"features": []})
        disruptions, status = noaa.fetch(mock=False)
        assert status.used_mock is True
        assert status.reason == "empty live response"


class TestFaaMock:
    def test_forced_mock(self):
        disruptions, status = faa.fetch(iatas=["JFK", "LAX"], mock=True)
        assert status.used_mock is True
        # At least one airport in the fixture has a disruption (e.g. JFK)
        assert any(d.area == "JFK" for d in disruptions)
        assert all(d.kind == "airport_ops" for d in disruptions)
        assert all(d.source == "mock-faa" for d in disruptions)

    def test_normal_airports_not_emitted(self):
        disruptions, _ = faa.fetch(iatas=["LAX"], mock=True)
        # LAX is "Normal" in the fixture so no disruption for it
        assert not any(d.area == "LAX" for d in disruptions)

    def test_fallback_when_network_fails(self, monkeypatch):
        monkeypatch.setattr(faa, "safe_get", lambda *a, **kw: None)
        disruptions, status = faa.fetch(iatas=["JFK"], mock=False)
        assert status.used_mock is True
        assert status.reason == "live fetch failed"


class TestGdeltMock:
    def test_forced_mock(self):
        disruptions, status = gdelt.fetch(mock=True)
        assert status.used_mock is True
        assert len(disruptions) > 0
        assert all(d.kind == "geopolitical" for d in disruptions)
        assert all(d.source == "mock-gdelt" for d in disruptions)

    def test_tone_to_severity(self):
        assert gdelt._tone_to_severity(-9.0) == 5
        assert gdelt._tone_to_severity(-6.0) == 4
        assert gdelt._tone_to_severity(-3.0) == 3
        assert gdelt._tone_to_severity(-1.0) == 2
        assert gdelt._tone_to_severity(0.0) == 1
        assert gdelt._tone_to_severity(3.0) == 1

    def test_fallback_when_network_fails(self, monkeypatch):
        monkeypatch.setattr(gdelt, "safe_get", lambda *a, **kw: None)
        disruptions, status = gdelt.fetch(mock=False)
        assert status.used_mock is True
        assert status.reason == "live fetch failed"


class TestSafeGet:
    def test_returns_none_on_exception(self, monkeypatch):
        import requests

        def boom(*a, **kw):
            raise requests.ConnectionError("no network")

        monkeypatch.setattr(base.requests, "get", boom)
        assert base.safe_get("https://example.org") is None

    def test_returns_none_on_non_200(self, monkeypatch):
        class FakeResp:
            status_code = 500

            def json(self):  # pragma: no cover
                return {}

        monkeypatch.setattr(base.requests, "get", lambda *a, **kw: FakeResp())
        assert base.safe_get("https://example.org") is None
