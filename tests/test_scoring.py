"""Unit tests for scoring logic."""

from __future__ import annotations

from weather_god.config import DELAY_BANDS, WEIGHTS
from weather_god.models import Disruption
from weather_god.scoring import (
    airport_ops_subscore,
    build_airport_report,
    build_lane_report,
    combined_score,
    delay_band,
    geopolitical_subscore,
    weather_subscore,
)


class TestWeatherSubscore:
    def test_empty(self):
        assert weather_subscore([]) == 0

    def test_ignores_non_weather(self, faa_closure):
        assert weather_subscore([faa_closure]) == 0

    def test_one_severe(self, severe_weather):
        # severity 4 * 20 = 80
        assert weather_subscore([severe_weather]) == 80

    def test_clamps_at_100(self, extreme_weather):
        # 3x severity 5 = 300, clamped to 100
        assert weather_subscore([extreme_weather, extreme_weather, extreme_weather]) == 100


class TestAirportOpsSubscore:
    def test_empty(self):
        assert airport_ops_subscore([]) == 0

    def test_closure_is_100(self, faa_closure):
        assert airport_ops_subscore([faa_closure]) == 100

    def test_minor_delay_is_30(self, faa_minor_delay):
        assert airport_ops_subscore([faa_minor_delay]) == 30

    def test_worst_wins(self, faa_closure, faa_minor_delay):
        assert airport_ops_subscore([faa_minor_delay, faa_closure]) == 100


class TestGeopoliticalSubscore:
    def test_empty(self):
        assert geopolitical_subscore([]) == 0

    def test_single_negative_event(self, geo_event):
        # 15 * 1 event + 10 * bucket3(tone -6) = 15 + 30 = 45
        assert geopolitical_subscore([geo_event]) == 45

    def test_multiple_clamps_at_100(self):
        many = [
            Disruption(
                source="mock-gdelt",
                kind="geopolitical",
                severity=5,
                headline="x",
                area="Red Sea",
                tone=-9.0,
            )
            for _ in range(10)
        ]
        assert geopolitical_subscore(many) == 100


class TestCombinedScore:
    def test_empty_is_zero(self):
        score, factors = combined_score([])
        assert score == 0
        assert factors == {"weather": 0, "airport_ops": 0, "geopolitical": 0}

    def test_weighted_sum(self, severe_weather, faa_closure, geo_event):
        score, factors = combined_score([severe_weather, faa_closure, geo_event])
        expected_factors = {"weather": 80, "airport_ops": 100, "geopolitical": 45}
        assert factors == expected_factors
        expected = round(
            WEIGHTS["weather"] * 80
            + WEIGHTS["airport_ops"] * 100
            + WEIGHTS["geopolitical"] * 45
        )
        assert score == expected

    def test_monotonic_more_disruptions_ge_fewer(self, severe_weather, geo_event):
        score_small, _ = combined_score([severe_weather])
        score_big, _ = combined_score([severe_weather, geo_event])
        assert score_big >= score_small

    def test_score_in_valid_range(self, extreme_weather, faa_closure):
        score, _ = combined_score([extreme_weather, faa_closure] * 5)
        assert 0 <= score <= 100

    def test_weights_sum_to_one(self):
        assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9


class TestDelayBand:
    def test_boundaries(self):
        assert delay_band(0)[0] == "0 days"
        assert delay_band(19)[0] == "0 days"
        assert delay_band(20)[0] == "+0–1 days"
        assert delay_band(39)[0] == "+0–1 days"
        assert delay_band(40)[0] == "+1–3 days"
        assert delay_band(59)[0] == "+1–3 days"
        assert delay_band(60)[0] == "+3–7 days"
        assert delay_band(79)[0] == "+3–7 days"
        assert delay_band(80)[0] == "+7–14 days"
        assert delay_band(100)[0] == "+7–14 days"

    def test_clamps_out_of_range(self):
        assert delay_band(-5)[0] == "0 days"
        assert delay_band(500)[0] == "+7–14 days"

    def test_band_days_are_sane(self):
        for upper, _label, low, high in DELAY_BANDS:
            assert 0 <= low <= high
            assert 0 <= upper <= 100


class TestLaneReport:
    def test_builds_with_tagged_weather(self, suez_lane, severe_weather, geo_event):
        lr = build_lane_report(suez_lane, [severe_weather, geo_event])
        assert lr.lane is suez_lane
        assert len(lr.disruptions) == 2
        assert lr.score > 0
        assert lr.factors["weather"] == 80
        assert lr.delay_label

    def test_ignores_unrelated(self, suez_lane):
        unrelated = Disruption(
            source="mock-noaa",
            kind="weather",
            severity=5,
            headline="Snowstorm in Alaska",
            area="Alaska",
        )
        lr = build_lane_report(suez_lane, [unrelated])
        assert lr.score == 0
        assert lr.disruptions == []

    def test_nearby_airport_delay_counts(self, suez_lane):
        dxb_delay = Disruption(
            source="mock-faa",
            kind="airport_ops",
            severity=3,
            headline="Dust delays",
            area="DXB",
            delay_minutes=50,
        )
        lr = build_lane_report(suez_lane, [dxb_delay])
        assert lr.factors["airport_ops"] == 60
        assert lr.score > 0


class TestAirportReport:
    def test_status_label_from_worst_op(self, jfk_airport, faa_closure):
        ar = build_airport_report(jfk_airport, [faa_closure])
        assert ar.status_label == "Temporary closure"
        assert ar.score > 0
        assert ar.factors["airport_ops"] == 100

    def test_normal_when_no_ops(self, jfk_airport):
        ar = build_airport_report(jfk_airport, [])
        assert ar.status_label == "Normal"
        assert ar.score == 0
