"""TMF unit/cost arithmetic on declared synthetic examples; no market data input."""
import json
from datetime import datetime, timezone
from pathlib import Path


def calculate():
    point_value = 10
    example_level = 49000
    tax_rate = 0.00002
    result = {
        "cost_model_id": "tmf-002-synthetic-v1",
        "instrument": "TAIFEX:TMF",
        "status": "synthetic_cost_arithmetic_only",
        "market_data_used": False,
        "historical_backtest_executed": False,
        "point_value_twd": point_value,
        "tick_points": 1,
        "example_price_points": example_level,
        "example_price_kind": "chosen_round_number_not_observed_market_input",
        "tax_rate": tax_rate,
        "tax_basis": "TAIFEX stock-index category rule; TMF-specific row and rounding unverified",
        "commission_and_slippage_kind": "uncalibrated_research_assumptions",
        "spread_added_separately": False,
        "scenarios": [],
    }
    for name, fee, slip in [("low", 10, 1), ("middle", 20, 3), ("high", 30, 5)]:
        tax = 2 * example_level * point_value * tax_rate
        cost = 2 * fee + tax + 2 * slip * point_value
        scenario = {
            "id": name,
            "commission_per_side_twd": fee,
            "slippage_per_side_points": slip,
            "round_trip_tax_twd_estimate": round(tax, 4),
            "round_trip_cost_twd_estimate": round(cost, 4),
            "gross_break_even_points": round(cost / point_value, 4),
            "binary_outcome_examples": [],
        }
        for stop in (100, 20):
            loss = stop * point_value
            gain = 2 * loss
            scenario["binary_outcome_examples"].append({
                "stop_points": stop,
                "target_points": 2 * stop,
                "gross_loss_twd": loss,
                "gross_gain_twd": gain,
                "net_loss_twd_estimate": round(loss + cost, 4),
                "net_gain_twd_estimate": round(gain - cost, 4),
                "break_even_win_rate": round((loss + cost) / (gain + loss), 8),
            })
        result["scenarios"].append(scenario)
    return result


if __name__ == "__main__":
    output = calculate()
    output["calculated_at"] = datetime.now(timezone.utc).isoformat()
    target = Path(__file__).with_name("cost-results.json")
    target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"output": str(target), "status": output["status"],
                      "round_trip_costs_twd": [s["round_trip_cost_twd_estimate"]
                                               for s in output["scenarios"]]}))
