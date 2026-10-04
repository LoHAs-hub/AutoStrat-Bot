"""Reproduce synthetic logic and packet checks; never compile Pine or backtest market data."""
import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
sys.dont_write_bytecode = True


def read(path):
    return json.loads(path.read_text())


def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def run(command, log):
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(command, cwd=REPO, text=True, capture_output=True, check=False)
    output = result.stdout + result.stderr
    (HERE / log).write_text(output)
    return {"command": command, "started_at": started, "finished_at": datetime.now(timezone.utc).isoformat(),
            "exit_code": result.returncode, "log": log}, output


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", action="store_true", help="Also run the existing application verification")
    args = parser.parse_args()
    relative = HERE.relative_to(REPO).as_posix()
    logic, output = run(["node", "--test", "--test-reporter=tap", relative + "/reference.test.mjs"], "verification.tap")
    for field in ("tests", "pass", "fail", "cancelled", "skipped", "todo"):
        match = re.search(r"^# " + field + r" (\d+)$", output, re.M)
        logic[field] = int(match.group(1)) if match else None
    logic["status"] = "passed" if logic["exit_code"] == 0 and logic["tests"] and logic["pass"] == logic["tests"] else "failed"
    examples, _ = run(["node", relative + "/counterexamples.mjs"], "counterexamples.json")
    packet = []
    try:
        spec = read(HERE / "strategy-A-v2.json")
        Draft202012Validator(read(REPO / "schemas/strategy-spec.schema.json")).validate(spec)
        assert spec["status"] == "draft" and spec["data_snapshot_id"] is None
        units = read(REPO / "research/cycles/tmf-001/knowledge.json")["units"]
        versions = {(u["id"], u["version"]) for u in units}
        assert all((r["id"], r["version"]) in versions for r in spec["knowledge_refs"])
        packet.append("existing StrategySpec schema and fixed knowledge versions")
        for record in read(HERE / "experiment.json")["evidence"]:
            path = HERE / record["path"]
            assert hashlib.sha256(path.read_bytes()).hexdigest() == record["sha256"]
        packet.append("native-access and inherited-chart evidence hashes")
        for document in ("REPORT.md", "SPEC.md", "NATIVE-RUN.md"):
            for target in re.findall(r"\]\(([^)]+)\)", (HERE / document).read_text()):
                if not target.startswith(("https://", "http://", "#")):
                    target = target.split("#", 1)[0]
                    if target not in ("verification.json", "project-verification.json"):
                        assert (HERE / target).exists(), (document, target)
        packet.append("local review links")
        # Reuse the original audit without overwriting its historical validation.json.
        module_spec = importlib.util.spec_from_file_location("original_tmf002_audit", HERE.parents[1] / "verify.py")
        original = importlib.util.module_from_spec(module_spec)
        module_spec.loader.exec_module(original)
        inherited = original.audit()
        packet.append(f"original packet audit: {inherited['passed_checks']} checks; historical files untouched")
        packet_status = "passed"
    except Exception as error:
        packet_status = "failed"
        packet.append(f"{type(error).__name__}: {error}")
    hashes = {name: hashlib.sha256((HERE / name).read_bytes()).hexdigest()
              for name in ("tmf002_a2.pine", "reference.mjs", "reference.test.mjs", "counterexamples.mjs", "verify.py", "SPEC.md", "strategy-A-v2.json", "experiment.json")}
    result = {"experiment": "tmf-002-a2", "verified_at": datetime.now(timezone.utc).isoformat(),
              "status": "synthetic_and_packet_checks_only", "logic": logic, "examples": examples,
              "packet_status": packet_status, "packet_checks": packet, "source_sha256": hashes,
              "native_pine_compilation": "unrun: anonymous Ctrl+Enter opened Sign in",
              "native_fill_parity": "unrun", "tmf_historical_backtest": "unrun",
              "strategy_effectiveness": "unknown; not tested", "market_data_used_in_calculations": False}
    success = logic["status"] == "passed" and packet_status == "passed" and examples["exit_code"] == 0
    if args.project:
        project, _ = run(["npm", "run", "verify"], "project-verification.log")
        project["scope"] = "existing application check, integration tests and Worker build; not strategy validation"
        write("project-verification.json", project)
        success = success and project["exit_code"] == 0
    result["all_requested_checks_passed"] = bool(success)
    write("verification.json", result)
    print(json.dumps({"passed": bool(success), "synthetic_tests": logic["pass"], "packet": packet_status,
                      "native_compilation": "unrun", "tmf_performance": "unrun"}, ensure_ascii=False))
    return 0 if success else 1


if __name__ == "__main__":
    raise SystemExit(main())
