"""Audit a research review packet; does not test strategy performance."""
import hashlib
import json
import re
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]


def read(name):
    return json.loads((ROOT / name).read_text())


def audit():
    checks = []

    def record(name, details):
        checks.append({"name": name, "status": "passed", "details": details})

    schema = json.loads((REPO / "schemas/strategy-spec.schema.json").read_text())
    validator = Draft202012Validator(schema)
    specs = [read("strategy-A.json"), read("strategy-B.json")]
    for spec in specs:
        validator.validate(spec)
        assert spec["instrument"] == "TAIFEX:TMF"
        assert spec["status"] == "draft"
        assert spec["data_snapshot_id"] is None
        assert spec["risk"]["per_trade_twd"] is None
        assert spec["risk"]["daily_loss_twd"] is None
    record("existing_strategy_schema_and_draft_state", "2 drafts; no personal risk budget or historical data snapshot claimed")

    units = json.loads((ROOT.parent / "tmf-001/knowledge.json").read_text())["units"]
    inherited = {(unit["id"], unit["version"]) for unit in units}
    for spec in specs:
        for ref in spec["knowledge_refs"]:
            assert (ref["id"], ref["version"]) in inherited
        assert spec["principle_refs"] == ["P001"]
    record("inherited_knowledge_versions", "All 16 references exist in tmf-001; P001 retained")

    sources = read("sources.json")
    ids = {source["id"] for source in sources["source_records"]}
    assert len(ids) == len(sources["source_records"])
    for source in sources["source_records"]:
        assert source["url"].startswith("https://")
        if source["kind"] == "community_opinion":
            assert source["original_instrument"] == "TAIFEX:TXF1!"
            assert source["use"] == "hypothesis_reference_only"
            assert source["tmf_numeric_evidence"] is False
    assert sources["raw_market_dataset_included"] is False
    record("source_identity_and_reference_roles", "8 source records; TXF opinions explicitly separated from TMF numerical evidence")

    for evidence in sources["evidence_records"]:
        path = ROOT / evidence["path"]
        assert evidence["source_id"] in ids
        assert path.stat().st_size == evidence["bytes"]
        assert hashlib.sha256(path.read_bytes()).hexdigest() == evidence["sha256"]
    record("local_evidence_hashes", "3 screenshot files match manifest; source webpage hashes retained as original retrieval metadata, not re-fetched")

    costs = read("cost-results.json")
    assert costs["market_data_used"] is False
    assert costs["historical_backtest_executed"] is False
    assert costs["point_value_twd"] == 10
    assert costs["tick_points"] == 1
    expected_costs = [Decimal("59.6"), Decimal("119.6"), Decimal("179.6")]
    for scenario, expected in zip(costs["scenarios"], expected_costs, strict=True):
        # Independently reconcile declared components using decimal units.
        tax = Decimal("49000") * Decimal("10") * Decimal("0.00002") * 2
        computed = 2 * Decimal(scenario["commission_per_side_twd"]) + tax + 20 * Decimal(scenario["slippage_per_side_points"])
        assert computed == expected == Decimal(str(scenario["round_trip_cost_twd_estimate"]))
        for example in scenario["binary_outcome_examples"]:
            stop = Decimal(example["stop_points"]) * 10
            gain = stop * 2
            p = (stop + computed) / (stop + gain)
            assert abs(p - Decimal(str(example["break_even_win_rate"]))) < Decimal("0.00000001")
    assert all(spec["cost_model_id"] == costs["cost_model_id"] for spec in specs)
    record("synthetic_cost_units_and_break_even_arithmetic", "3 component-reconciled costs and 6 binary-outcome examples; no empirical cost or performance result")

    run = read("run.json")
    assert set(run["sources_used"]) <= ids
    assert run["data_usage"]["observed_windows_used_for_hypothesis_selection"] is True
    assert run["data_usage"]["holdout_evaluated"] is False
    assert run["data_usage"]["parameter_search_trials"] == 0
    assert run["data_usage"]["quarantined_diagnostic_daily_bars_used"] is False
    assert "Strategy_Tester_backtest" in run["unrun"]
    assert all(value is False for value in run["scope"].values())
    record("execution_and_scope_disclosures", "Exploration windows reused for selection; backtest and holdout unrun; no live/paid/publication/application changes")

    link_count = 0
    for document in ("TASK.md", "TASK-v0.1.md", "REPORT.md", "OBSERVATIONS.md", "CANDIDATES.md", "COSTS.md"):
        text = (ROOT / document).read_text()
        for target in re.findall(r"\]\(([^)]+)\)", text):
            if target.startswith(("https://", "http://", "#")):
                continue
            if target == "validation.json":
                # This audit creates that report after all input checks pass.
                continue
            assert (ROOT / target.split("#", 1)[0]).exists(), (document, target)
            link_count += 1
    record("local_review_document_links", f"{link_count} local links resolve; all 6 review documents exist")
    assert not list(ROOT.rglob("*.csv"))
    assert not list(ROOT.rglob("*.quarantined"))
    record("review_packet_data_boundary", "No historical market CSV or quarantined capture in review directory")

    return {
        "cycle_id": "tmf-002",
        "validated_at": datetime.now(timezone.utc).isoformat(),
        "status": "review_packet_integrity_passed_only",
        "checks": checks,
        "passed_checks": len(checks),
        "strategy_effectiveness": "unknown; not tested",
        "pine_compilation": "unrun",
        "historical_backtest": "unrun",
        "holdout_evaluation": "unrun",
    }


if __name__ == "__main__":
    result = audit()
    target = ROOT / "validation.json"
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": result["status"], "passed_checks": result["passed_checks"],
                      "strategy_effectiveness": result["strategy_effectiveness"]}))
