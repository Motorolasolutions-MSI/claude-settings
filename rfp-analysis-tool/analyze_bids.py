#!/usr/bin/env python3
"""
Heavyweight Air RFP Bid Analysis Engine

Analyzes and compares supplier bids for heavyweight air freight RFPs.
Produces scored rankings, cost comparisons, and risk assessments.

Usage:
    python analyze_bids.py [--bids data/sample_bids.csv] [--volume data/volume_profile.csv]
                           [--weights data/evaluation_weights.json] [--output output/]
"""

import argparse
import csv
import json
import os
import sys
from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class BidRow:
    supplier_name: str
    lane_origin: str
    lane_destination: str
    weight_break_kg: float
    rate_per_kg: float
    fuel_surcharge_pct: float
    security_surcharge_per_kg: float
    peak_surcharge_pct: float
    min_transit_days: int
    max_transit_days: int
    capacity_kg_per_week: float
    on_time_pct: float
    damage_rate_pct: float
    claims_ratio_pct: float
    financial_stability_score: float
    technology_score: float
    customer_service_score: float
    scalability_score: float
    min_volume_commitment_kg: float
    rate_escalation_cap_pct: float
    contract_term_months: int
    exit_notice_days: int


@dataclass
class VolumeRow:
    lane_origin: str
    lane_destination: str
    weight_break_kg: float
    annual_shipments: int
    avg_weight_per_shipment_kg: float


@dataclass
class SupplierSummary:
    name: str
    total_annual_cost: float = 0.0
    weighted_transit_days: float = 0.0
    avg_on_time_pct: float = 0.0
    avg_damage_rate_pct: float = 0.0
    avg_claims_ratio_pct: float = 0.0
    total_weekly_capacity: float = 0.0
    financial_stability_score: float = 0.0
    technology_score: float = 0.0
    customer_service_score: float = 0.0
    scalability_score: float = 0.0
    min_volume_commitment_kg: float = 0.0
    rate_escalation_cap_pct: float = 0.0
    contract_term_months: int = 0
    exit_notice_days: int = 0
    lanes_covered: int = 0
    total_lanes: int = 0
    cost_by_lane: dict = field(default_factory=dict)
    cost_score: float = 0.0
    transit_score: float = 0.0
    reliability_score: float = 0.0
    capacity_score: float = 0.0
    qualitative_score: float = 0.0
    contract_score: float = 0.0
    total_weighted_score: float = 0.0
    risk_flags: list = field(default_factory=list)


def load_bids(filepath):
    """Load bid data from CSV file."""
    bids = []
    with open(filepath, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            bids.append(BidRow(
                supplier_name=row["supplier_name"].strip(),
                lane_origin=row["lane_origin"].strip(),
                lane_destination=row["lane_destination"].strip(),
                weight_break_kg=float(row["weight_break_kg"]),
                rate_per_kg=float(row["rate_per_kg"]),
                fuel_surcharge_pct=float(row["fuel_surcharge_pct"]),
                security_surcharge_per_kg=float(row["security_surcharge_per_kg"]),
                peak_surcharge_pct=float(row["peak_surcharge_pct"]),
                min_transit_days=int(row["min_transit_days"]),
                max_transit_days=int(row["max_transit_days"]),
                capacity_kg_per_week=float(row["capacity_kg_per_week"]),
                on_time_pct=float(row["on_time_pct"]),
                damage_rate_pct=float(row["damage_rate_pct"]),
                claims_ratio_pct=float(row["claims_ratio_pct"]),
                financial_stability_score=float(row["financial_stability_score"]),
                technology_score=float(row["technology_score"]),
                customer_service_score=float(row["customer_service_score"]),
                scalability_score=float(row["scalability_score"]),
                min_volume_commitment_kg=float(row["min_volume_commitment_kg"]),
                rate_escalation_cap_pct=float(row["rate_escalation_cap_pct"]),
                contract_term_months=int(row["contract_term_months"]),
                exit_notice_days=int(row["exit_notice_days"]),
            ))
    return bids


def load_volume_profile(filepath):
    """Load volume profile from CSV file."""
    volumes = []
    with open(filepath, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            volumes.append(VolumeRow(
                lane_origin=row["lane_origin"].strip(),
                lane_destination=row["lane_destination"].strip(),
                weight_break_kg=float(row["weight_break_kg"]),
                annual_shipments=int(row["annual_shipments"]),
                avg_weight_per_shipment_kg=float(row["avg_weight_per_shipment_kg"]),
            ))
    return volumes


def load_weights(filepath):
    """Load evaluation weights from JSON file."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {k: v["weight"] for k, v in data["weights"].items()}


def calculate_all_in_cost_per_kg(bid):
    """Calculate the total all-in cost per kg for a bid row."""
    base = bid.rate_per_kg
    fuel = base * (bid.fuel_surcharge_pct / 100.0)
    security = bid.security_surcharge_per_kg
    peak = base * (bid.peak_surcharge_pct / 100.0)
    return base + fuel + security + peak


def build_supplier_summaries(bids, volumes, weights):
    """Build per-supplier summary with scores across all dimensions."""
    # Group bids by supplier
    supplier_bids = defaultdict(list)
    for bid in bids:
        supplier_bids[bid.supplier_name].append(bid)

    # Build lane lookup from volume profile
    volume_lookup = {}
    total_lanes = len(volumes)
    total_annual_weight = 0.0
    for v in volumes:
        key = (v.lane_origin, v.lane_destination, v.weight_break_kg)
        volume_lookup[key] = v
        total_annual_weight += v.annual_shipments * v.avg_weight_per_shipment_kg

    summaries = {}

    for supplier_name, bid_rows in supplier_bids.items():
        s = SupplierSummary(name=supplier_name)
        s.total_lanes = total_lanes

        # Build bid lookup for this supplier
        bid_lookup = {}
        for b in bid_rows:
            key = (b.lane_origin, b.lane_destination, b.weight_break_kg)
            bid_lookup[key] = b

        # Calculate costs and transit using volume profile
        total_cost = 0.0
        total_shipment_weight = 0.0
        transit_weighted_sum = 0.0
        lanes_matched = 0

        for key, vol in volume_lookup.items():
            if key in bid_lookup:
                bid = bid_lookup[key]
                lanes_matched += 1
                all_in_rate = calculate_all_in_cost_per_kg(bid)
                shipment_weight = vol.annual_shipments * vol.avg_weight_per_shipment_kg
                lane_cost = all_in_rate * shipment_weight
                total_cost += lane_cost
                total_shipment_weight += shipment_weight

                avg_transit = (bid.min_transit_days + bid.max_transit_days) / 2.0
                transit_weighted_sum += avg_transit * shipment_weight

                lane_label = f"{vol.lane_origin}-{vol.lane_destination} ({int(vol.weight_break_kg)}kg)"
                s.cost_by_lane[lane_label] = {
                    "all_in_rate": round(all_in_rate, 4),
                    "annual_cost": round(lane_cost, 2),
                    "shipments": vol.annual_shipments,
                }

        s.total_annual_cost = round(total_cost, 2)
        s.lanes_covered = lanes_matched
        if total_shipment_weight > 0:
            s.weighted_transit_days = round(transit_weighted_sum / total_shipment_weight, 2)

        # Use first bid row for supplier-level qualitative data (same for all lanes)
        first_bid = bid_rows[0]
        s.avg_on_time_pct = first_bid.on_time_pct
        s.avg_damage_rate_pct = first_bid.damage_rate_pct
        s.avg_claims_ratio_pct = first_bid.claims_ratio_pct
        s.financial_stability_score = first_bid.financial_stability_score
        s.technology_score = first_bid.technology_score
        s.customer_service_score = first_bid.customer_service_score
        s.scalability_score = first_bid.scalability_score
        s.min_volume_commitment_kg = first_bid.min_volume_commitment_kg
        s.rate_escalation_cap_pct = first_bid.rate_escalation_cap_pct
        s.contract_term_months = first_bid.contract_term_months
        s.exit_notice_days = first_bid.exit_notice_days

        # Total weekly capacity across all lanes
        seen_lanes = set()
        for b in bid_rows:
            lane_key = (b.lane_origin, b.lane_destination)
            if lane_key not in seen_lanes:
                s.total_weekly_capacity += b.capacity_kg_per_week
                seen_lanes.add(lane_key)

        summaries[supplier_name] = s

    # --- Scoring: normalize each dimension to 0-100 ---
    suppliers = list(summaries.values())

    # Cost score: lower is better
    costs = [s.total_annual_cost for s in suppliers if s.total_annual_cost > 0]
    if costs:
        min_cost, max_cost = min(costs), max(costs)
        cost_range = max_cost - min_cost if max_cost > min_cost else 1.0
        for s in suppliers:
            if s.total_annual_cost > 0:
                s.cost_score = round(100 * (1 - (s.total_annual_cost - min_cost) / cost_range), 2)

    # Transit score: lower is better
    transits = [s.weighted_transit_days for s in suppliers if s.weighted_transit_days > 0]
    if transits:
        min_t, max_t = min(transits), max(transits)
        t_range = max_t - min_t if max_t > min_t else 1.0
        for s in suppliers:
            if s.weighted_transit_days > 0:
                s.transit_score = round(100 * (1 - (s.weighted_transit_days - min_t) / t_range), 2)

    # Reliability score: composite of on_time (higher=better), damage (lower=better), claims (lower=better)
    for s in suppliers:
        on_time_norm = s.avg_on_time_pct / 100.0 * 100  # scale 0-100
        damage_norm = max(0, 100 - s.avg_damage_rate_pct * 50)  # 0% -> 100, 2% -> 0
        claims_norm = max(0, 100 - s.avg_claims_ratio_pct * 40)  # 0% -> 100, 2.5% -> 0
        s.reliability_score = round(on_time_norm * 0.5 + damage_norm * 0.25 + claims_norm * 0.25, 2)

    # Capacity score: higher is better, combined with scalability
    capacities = [s.total_weekly_capacity for s in suppliers]
    if capacities:
        max_cap = max(capacities)
        if max_cap > 0:
            for s in suppliers:
                cap_norm = (s.total_weekly_capacity / max_cap) * 100
                scale_norm = s.scalability_score * 10  # 1-10 -> 10-100
                s.capacity_score = round(cap_norm * 0.6 + scale_norm * 0.4, 2)

    # Qualitative score: average of financial, technology, customer service (all 1-10)
    for s in suppliers:
        avg_qual = (s.financial_stability_score + s.technology_score + s.customer_service_score) / 3.0
        s.qualitative_score = round(avg_qual * 10, 2)  # scale to 0-100

    # Contract flexibility score: prefer lower commitment, lower escalation, shorter term, shorter exit
    commitments = [s.min_volume_commitment_kg for s in suppliers]
    escalations = [s.rate_escalation_cap_pct for s in suppliers]
    terms = [s.contract_term_months for s in suppliers]
    exits = [s.exit_notice_days for s in suppliers]

    def safe_inverse_norm(values, val):
        """Normalize where lower is better, producing 0-100 score."""
        mn, mx = min(values), max(values)
        rng = mx - mn if mx > mn else 1.0
        return (1 - (val - mn) / rng) * 100

    for s in suppliers:
        commit_norm = safe_inverse_norm(commitments, s.min_volume_commitment_kg)
        escal_norm = safe_inverse_norm(escalations, s.rate_escalation_cap_pct)
        term_norm = safe_inverse_norm(terms, s.contract_term_months)
        exit_norm = safe_inverse_norm(exits, s.exit_notice_days)
        s.contract_score = round(
            commit_norm * 0.3 + escal_norm * 0.3 + term_norm * 0.2 + exit_norm * 0.2, 2
        )

    # Final weighted score
    for s in suppliers:
        s.total_weighted_score = round(
            s.cost_score * weights.get("total_cost", 0.35)
            + s.transit_score * weights.get("transit_time", 0.15)
            + s.reliability_score * weights.get("reliability", 0.15)
            + s.capacity_score * weights.get("capacity", 0.10)
            + s.qualitative_score * weights.get("qualitative", 0.15)
            + s.contract_score * weights.get("contract_flexibility", 0.10),
            2,
        )

    # Risk analysis
    for s in suppliers:
        if s.lanes_covered < s.total_lanes:
            s.risk_flags.append(
                f"Coverage gap: only {s.lanes_covered}/{s.total_lanes} lanes quoted"
            )
        if s.avg_on_time_pct < 92.0:
            s.risk_flags.append(f"Low on-time performance: {s.avg_on_time_pct}%")
        if s.avg_damage_rate_pct > 0.5:
            s.risk_flags.append(f"High damage rate: {s.avg_damage_rate_pct}%")
        if s.avg_claims_ratio_pct > 1.0:
            s.risk_flags.append(f"High claims ratio: {s.avg_claims_ratio_pct}%")
        if s.rate_escalation_cap_pct > 4.0:
            s.risk_flags.append(
                f"High rate escalation cap: {s.rate_escalation_cap_pct}%"
            )
        if s.contract_term_months > 24:
            s.risk_flags.append(
                f"Long contract term: {s.contract_term_months} months"
            )
        if s.min_volume_commitment_kg > 12000:
            s.risk_flags.append(
                f"High min volume commitment: {s.min_volume_commitment_kg} kg"
            )
        if s.scalability_score < 7:
            s.risk_flags.append(f"Low scalability score: {s.scalability_score}/10")

    return summaries


def generate_ranking_report(summaries, output_dir):
    """Generate ranking report as CSV."""
    ranked = sorted(summaries.values(), key=lambda x: x.total_weighted_score, reverse=True)

    filepath = os.path.join(output_dir, "supplier_rankings.csv")
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Rank", "Supplier", "Total Weighted Score", "Cost Score", "Transit Score",
            "Reliability Score", "Capacity Score", "Qualitative Score", "Contract Score",
            "Total Annual Cost ($)", "Avg Transit (days)", "On-Time %",
            "Lanes Covered", "Weekly Capacity (kg)", "Risk Flags"
        ])
        for i, s in enumerate(ranked, 1):
            writer.writerow([
                i, s.name, s.total_weighted_score, s.cost_score, s.transit_score,
                s.reliability_score, s.capacity_score, s.qualitative_score, s.contract_score,
                f"{s.total_annual_cost:,.2f}", s.weighted_transit_days, s.avg_on_time_pct,
                f"{s.lanes_covered}/{s.total_lanes}", f"{s.total_weekly_capacity:,.0f}",
                "; ".join(s.risk_flags) if s.risk_flags else "None"
            ])
    return filepath


def generate_lane_cost_comparison(summaries, output_dir):
    """Generate per-lane cost comparison across suppliers."""
    filepath = os.path.join(output_dir, "lane_cost_comparison.csv")

    # Collect all lanes
    all_lanes = set()
    for s in summaries.values():
        all_lanes.update(s.cost_by_lane.keys())
    all_lanes = sorted(all_lanes)

    suppliers = sorted(summaries.keys())

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        header = ["Lane"] + [f"{sup} ($/kg)" for sup in suppliers] + [f"{sup} Annual ($)" for sup in suppliers]
        writer.writerow(header)

        for lane in all_lanes:
            row = [lane]
            for sup in suppliers:
                data = summaries[sup].cost_by_lane.get(lane, {})
                row.append(f"{data.get('all_in_rate', 'N/A')}")
            for sup in suppliers:
                data = summaries[sup].cost_by_lane.get(lane, {})
                cost = data.get("annual_cost", "N/A")
                row.append(f"{cost:,.2f}" if isinstance(cost, (int, float)) else cost)
            writer.writerow(row)
    return filepath


def generate_risk_report(summaries, output_dir):
    """Generate risk assessment report."""
    filepath = os.path.join(output_dir, "risk_assessment.csv")
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Supplier", "Risk Flag", "On-Time %", "Damage Rate %", "Claims Ratio %",
            "Min Volume Commitment (kg)", "Rate Escalation Cap %",
            "Contract Term (months)", "Exit Notice (days)", "Scalability Score"
        ])
        for s in sorted(summaries.values(), key=lambda x: len(x.risk_flags), reverse=True):
            flags = "; ".join(s.risk_flags) if s.risk_flags else "No significant risks"
            writer.writerow([
                s.name, flags, s.avg_on_time_pct, s.avg_damage_rate_pct,
                s.avg_claims_ratio_pct, s.min_volume_commitment_kg,
                s.rate_escalation_cap_pct, s.contract_term_months,
                s.exit_notice_days, s.scalability_score
            ])
    return filepath


def generate_json_output(summaries, output_dir):
    """Generate JSON output for the interactive dashboard."""
    filepath = os.path.join(output_dir, "analysis_results.json")
    ranked = sorted(summaries.values(), key=lambda x: x.total_weighted_score, reverse=True)

    results = {
        "generated_at": "See file timestamp",
        "suppliers": []
    }

    for i, s in enumerate(ranked, 1):
        results["suppliers"].append({
            "rank": i,
            "name": s.name,
            "scores": {
                "total_weighted": s.total_weighted_score,
                "cost": s.cost_score,
                "transit": s.transit_score,
                "reliability": s.reliability_score,
                "capacity": s.capacity_score,
                "qualitative": s.qualitative_score,
                "contract_flexibility": s.contract_score,
            },
            "financials": {
                "total_annual_cost": s.total_annual_cost,
                "cost_by_lane": s.cost_by_lane,
            },
            "performance": {
                "weighted_transit_days": s.weighted_transit_days,
                "on_time_pct": s.avg_on_time_pct,
                "damage_rate_pct": s.avg_damage_rate_pct,
                "claims_ratio_pct": s.avg_claims_ratio_pct,
            },
            "capacity": {
                "total_weekly_kg": s.total_weekly_capacity,
                "scalability_score": s.scalability_score,
            },
            "qualitative": {
                "financial_stability": s.financial_stability_score,
                "technology": s.technology_score,
                "customer_service": s.customer_service_score,
            },
            "contract": {
                "min_volume_commitment_kg": s.min_volume_commitment_kg,
                "rate_escalation_cap_pct": s.rate_escalation_cap_pct,
                "term_months": s.contract_term_months,
                "exit_notice_days": s.exit_notice_days,
            },
            "coverage": {
                "lanes_covered": s.lanes_covered,
                "total_lanes": s.total_lanes,
            },
            "risk_flags": s.risk_flags,
        })

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    return filepath


def print_summary(summaries):
    """Print a console summary of the analysis."""
    ranked = sorted(summaries.values(), key=lambda x: x.total_weighted_score, reverse=True)

    print("\n" + "=" * 90)
    print("HEAVYWEIGHT AIR RFP BID ANALYSIS — SUPPLIER RANKINGS")
    print("=" * 90)

    print(f"\n{'Rank':<5} {'Supplier':<25} {'Score':<8} {'Annual Cost':>14} {'Transit':>9} {'OTP':>6} {'Risks':>6}")
    print("-" * 90)

    for i, s in enumerate(ranked, 1):
        risk_count = len(s.risk_flags)
        print(
            f"{i:<5} {s.name:<25} {s.total_weighted_score:<8.2f} "
            f"${s.total_annual_cost:>12,.2f} {s.weighted_transit_days:>7.1f}d "
            f"{s.avg_on_time_pct:>5.1f}% {risk_count:>5}"
        )

    print("\n" + "-" * 90)
    print("SCORE BREAKDOWN:")
    print(f"{'Supplier':<25} {'Cost':>7} {'Transit':>8} {'Reliab':>8} {'Capac':>7} {'Qual':>7} {'Contr':>7}")
    print("-" * 90)

    for s in ranked:
        print(
            f"{s.name:<25} {s.cost_score:>7.1f} {s.transit_score:>8.1f} "
            f"{s.reliability_score:>8.1f} {s.capacity_score:>7.1f} "
            f"{s.qualitative_score:>7.1f} {s.contract_score:>7.1f}"
        )

    print("\n" + "-" * 90)
    print("RISK FLAGS:")
    for s in ranked:
        if s.risk_flags:
            print(f"\n  {s.name}:")
            for flag in s.risk_flags:
                print(f"    ⚠  {flag}")

    if ranked:
        winner = ranked[0]
        print(f"\n{'=' * 90}")
        print(f"RECOMMENDATION: {winner.name} (Score: {winner.total_weighted_score:.2f})")
        if len(ranked) >= 2:
            runner_up = ranked[1]
            print(f"RUNNER-UP:      {runner_up.name} (Score: {runner_up.total_weighted_score:.2f})")
        print(f"{'=' * 90}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Analyze heavyweight air RFP bids from multiple suppliers"
    )
    parser.add_argument(
        "--bids", default="data/sample_bids.csv",
        help="Path to the bid data CSV file"
    )
    parser.add_argument(
        "--volume", default="data/volume_profile.csv",
        help="Path to the volume profile CSV file"
    )
    parser.add_argument(
        "--weights", default="data/evaluation_weights.json",
        help="Path to the evaluation weights JSON file"
    )
    parser.add_argument(
        "--output", default="output/",
        help="Directory for output files"
    )
    args = parser.parse_args()

    # Resolve paths relative to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    bids_path = os.path.join(script_dir, args.bids) if not os.path.isabs(args.bids) else args.bids
    volume_path = os.path.join(script_dir, args.volume) if not os.path.isabs(args.volume) else args.volume
    weights_path = os.path.join(script_dir, args.weights) if not os.path.isabs(args.weights) else args.weights
    output_dir = os.path.join(script_dir, args.output) if not os.path.isabs(args.output) else args.output

    os.makedirs(output_dir, exist_ok=True)

    print("Loading bid data...")
    bids = load_bids(bids_path)
    print(f"  Loaded {len(bids)} bid rows")

    print("Loading volume profile...")
    volumes = load_volume_profile(volume_path)
    print(f"  Loaded {len(volumes)} lane/weight-break combinations")

    print("Loading evaluation weights...")
    weights = load_weights(weights_path)
    print(f"  Weights: {weights}")

    print("\nAnalyzing bids...")
    summaries = build_supplier_summaries(bids, volumes, weights)

    print("Generating reports...")
    ranking_file = generate_ranking_report(summaries, output_dir)
    print(f"  ✓ Ranking report: {ranking_file}")

    lane_file = generate_lane_cost_comparison(summaries, output_dir)
    print(f"  ✓ Lane cost comparison: {lane_file}")

    risk_file = generate_risk_report(summaries, output_dir)
    print(f"  ✓ Risk assessment: {risk_file}")

    json_file = generate_json_output(summaries, output_dir)
    print(f"  ✓ JSON output (for dashboard): {json_file}")

    print_summary(summaries)

    return 0


if __name__ == "__main__":
    sys.exit(main())
