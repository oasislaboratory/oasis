#!/usr/bin/env python3
"""Reproduce a structural baseline and check its run record; Python stdlib only."""
import argparse
import json
import re
import sys
from pathlib import Path, PurePosixPath

FIELDS = ("role", "status", "progress_percent", "confidence_percent", "assessed_by", "assessed_on", "scope")
STATUSES = {"planned", "in_progress", "ongoing", "blocked", "completed", "cancelled"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def scalar(value):
    if value == "null":
        return None
    if re.fullmatch(r"\d+", value):
        return int(value)
    if value.startswith('"'):
        return json.loads(value)
    if value.startswith("'") and value.endswith("'"):
        return value[1:-1].replace("''", "'")
    return value


def metadata(text):
    lines = text.splitlines()
    require(lines and lines[0] == "---", "missing YAML opening delimiter")
    require("---" in lines[1:], "missing YAML closing delimiter")
    fields = {}
    for line in lines[1:lines.index("---", 1)]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        key, separator, value = line.partition(":")
        require(separator and key not in fields, "invalid or duplicate metadata field")
        fields[key] = scalar(value.strip())
    require(all(key in fields for key in FIELDS), "missing required objective metadata")
    require(fields["status"] in STATUSES, "invalid objective status")
    for key in ("progress_percent", "confidence_percent"):
        value = fields[key]
        require(value is None or type(value) is int and 0 <= value <= 100, "invalid percentage")
    return fields


def extract(source):
    require(re.fullmatch(r"[0-9a-f]{40}", source["commit"]), "source commit must be a pinned 40-character SHA")
    files = source["files"]
    objectives = []
    for path in sorted(files):
        if PurePosixPath(path).name != "objective.md":
            continue
        fields = metadata(files[path])
        status_path = str(PurePosixPath(path).with_name("status.md"))
        status_path = status_path if status_path in files else None
        text = files[path] + ("\n" + files[status_path] if status_path else "")
        links = sorted(set(re.findall(r"\[[^\]]*\]\(([^)]+)\)", text)))
        objectives.append({"path": path, **{key: fields[key] for key in ("role", "status", "progress_percent", "confidence_percent", "scope")}, "status_path": status_path, "evidence_links": links})
    return {"repository": source["repository"], "commit": source["commit"], "assessed_on": source["assessed_on"], "objectives": objectives, "counts": {"objectives": len(objectives), "status_logs": sum(PurePosixPath(path).name == "status.md" for path in files), "completed_objectives": sum(row["status"] == "completed" for row in objectives)}}


def schema_check(value, schema, path="$", root=None):
    """Validate the deliberately small JSON Schema subset used by this package."""
    root = schema if root is None else root
    if "$ref" in schema:
        require(schema["$ref"].startswith("#/"), "only local JSON Schema references supported")
        target = root
        for component in schema["$ref"][2:].split("/"):
            target = target[component.replace("~1", "/").replace("~0", "~")]
        schema_check(value, target, path, root)
        return
    types = {"null": value is None, "string": isinstance(value, str), "integer": type(value) is int, "number": type(value) in (int, float), "boolean": type(value) is bool, "object": isinstance(value, dict), "array": isinstance(value, list)}
    if "type" in schema:
        allowed = schema["type"] if isinstance(schema["type"], list) else [schema["type"]]
        require(any(types.get(kind, False) for kind in allowed), path + ": wrong type")
    if "enum" in schema:
        require(value in schema["enum"], path + ": outside enum")
    if isinstance(value, dict):
        require(all(key in value for key in schema.get("required", [])), path + ": missing required property")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            require(set(value) <= set(properties), path + ": unexpected property")
        for key, entry in value.items():
            if key in properties:
                schema_check(entry, properties[key], path + "." + key, root)
    if isinstance(value, list):
        if "minItems" in schema:
            require(len(value) >= schema["minItems"], path + ": too few items")
        for index, entry in enumerate(value):
            if "items" in schema:
                schema_check(entry, schema["items"], f"{path}[{index}]", root)
    if isinstance(value, str) and "pattern" in schema:
        require(re.search(schema["pattern"], value), path + ": pattern mismatch")
    if type(value) in (int, float):
        require("minimum" not in schema or value >= schema["minimum"], path + ": below minimum")
        require("maximum" not in schema or value <= schema["maximum"], path + ": above maximum")


def validate(source, baseline, run, schema):
    expected = extract(source)
    for key, value in expected.items():
        require(baseline.get(key) == value, "baseline mismatch: " + key)
    require(isinstance(baseline.get("measurement_limits"), list) and all(isinstance(x, str) for x in baseline["measurement_limits"]), "missing measurement limitations")
    schema_check(run, schema)
    require(run["input_commit"] == source["commit"], "run input commit differs from source")
    for path in run["modified_paths"]:
        parts = PurePosixPath(path).parts
        require(parts and parts[0] == "meta" and ".." not in parts and not path.startswith("/"), "run modified path outside meta: " + path)
    return {"result": "PASS", **expected["counts"], "checks": ["required objective metadata", "pinned source SHA", "reproduced baseline rows and links", "reproduced structural counts", "run-record schema", "run input commit", "Meta write paths"], "claim_limit": "Structural/source-record consistency only; no productivity, cost, customer, runtime, or performance claim."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--extract", action="store_true", help="print reproduced baseline fields, without measurement_limits")
    args = parser.parse_args()
    load = lambda name: json.loads((args.root / name).read_text())
    source = load("source-snapshot.json")
    result = extract(source) if args.extract else validate(source, load("baseline.json"), load("run-record.json"), load("run-record.schema.json"))
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, TypeError) as error:
        print("FAIL: " + str(error), file=sys.stderr)
        sys.exit(1)
