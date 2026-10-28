#!/usr/bin/env python3
"""Exercise the checker CLI against the pinned fixture and deliberate corruption."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
NAMES = ("source-snapshot.json", "baseline.json", "run-record.json", "run-record.schema.json")


def check_case(name, mutation, expected_code):
    files = {name: json.loads((ROOT / name).read_text()) for name in NAMES}
    mutation(files)
    with tempfile.TemporaryDirectory(prefix="checker-case-", dir=HERE) as temporary:
        folder = Path(temporary)
        for filename, contents in files.items():
            (folder / filename).write_text(json.dumps(contents))
        result = subprocess.run([sys.executable, str(HERE / "check_baseline.py"), "--root", str(folder)], capture_output=True, text=True)
    if result.returncode != expected_code:
        raise AssertionError(f"{name}: expected {expected_code}, got {result.returncode}: {result.stdout}{result.stderr}")
    return {"case": name, "result": "PASS", "expected_exit_code": expected_code, "actual_exit_code": result.returncode, "rejection": result.stderr.strip() or None}


cases = [
    ("valid pinned fixture", lambda files: None, 0),
    ("altered structural count", lambda files: files["baseline.json"]["counts"].update(objectives=999), 1),
    ("altered objective row", lambda files: files["baseline.json"]["objectives"][0].update(status="completed"), 1),
    ("un-pinned source", lambda files: files["source-snapshot.json"].update(commit="main"), 1),
    ("mismatched run input", lambda files: files["run-record.json"].update(input_commit="0" * 40), 1),
    ("out-of-scope write", lambda files: files["run-record.json"].update(modified_paths=["graphlang/objective.md"]), 1),
    ("path traversal", lambda files: files["run-record.json"].update(modified_paths=["meta/../README.md"]), 1),
    ("invalid telemetry type", lambda files: files["run-record.json"].update(cost_usd="unknown"), 1),
]
print(json.dumps({"result": "PASS", "cases": [check_case(*case) for case in cases]}, indent=2))
