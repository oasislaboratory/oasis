#!/usr/bin/env python3
"""Export objective.md files as one expanded page. Uses only Python's standard library.

From the repository root:
    python3 coordination/dogfood/view/export.py
Then open oasis.html. Run again after editing objectives.
"""

import argparse
from datetime import datetime, timezone
from html import escape
from pathlib import Path
import re
from urllib.parse import quote, urljoin, urlsplit


def inline(text, source):
    """Render evidence links, escaping all other text and rejecting unsafe URLs."""
    parts, end = [], 0
    for match in re.finditer(r"\[([^\]]+)\]\(([^\s)]+)\)", text):
        parts.append(escape(text[end:match.start()]))
        label, target = match.groups()
        url = urljoin(source, target)
        if urlsplit(url).scheme in {"http", "https"}:
            parts.append(f'<a href="{escape(url, quote=True)}">{escape(label)}</a>')
        else:
            parts.append(escape(match.group()))
        end = match.end()
    parts.append(escape(text[end:]))
    return "".join(parts)


def sections(text):
    result, heading, lines = [], "Objective", []
    for line in text.splitlines():
        match = re.match(r"^##\s+(.+?)\s*$", line)
        if match:
            if lines or heading != "Objective":
                result.append((heading, "\n".join(lines).strip()))
            heading, lines = match[1], []
        else:
            lines.append(line)
    if lines or heading != "Objective":
        result.append((heading, "\n".join(lines).strip()))
    return result


def export(root, output, source):
    paths = sorted(p for p in root.rglob("objective.md")
                   if not any(part.startswith(".") for part in p.relative_to(root).parts)
                   and not p.is_symlink())
    if not paths:
        raise ValueError(f"No objective.md files found in {root}")
    if output in paths:
        raise ValueError("Output must not overwrite an objective.md file")
    nodes = {p.parent: sections(p.read_text(encoding="utf-8")) for p in paths}
    children = {None: []}
    for directory in nodes:
        parent = next((p for p in directory.parents if p in nodes), None)
        children.setdefault(parent, []).append(directory)

    def render(directory):
        relative = directory.relative_to(root).as_posix()
        name = root.name if relative == "." else directory.name
        file_url = source.rstrip("/") + "/" + quote(
            (directory / "objective.md").relative_to(root).as_posix(), safe="/")
        body = []
        for heading, text in nodes[directory]:
            alert = heading.casefold() in {"blocked", "blockers", "permission needed", "permissions needed"} and bool(text)
            paragraphs = "".join("<p>" + inline(p, file_url).replace("\n", "<br>") + "</p>"
                                 for p in re.split(r"\n\s*\n", text) if p.strip())
            body.append(f'<section class="{"attention" if alert else ""}"><h3>{escape(heading)}</h3>{paragraphs}</section>')
        nested = "".join(render(child) for child in children.get(directory, []))
        return (f'<article><header><h2>{escape(name)}</h2>'
                f'<a class="path" href="{escape(file_url, quote=True)}">{escape(relative)}/objective.md</a></header>'
                + "".join(body) + (f'<div class="children">{nested}</div>' if nested else "") + '</article>')

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    page = '''<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Oasis — Objective tree</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f4f2eb;color:#25392f;font:16px/1.65 system-ui,sans-serif}
main{max-width:1080px;margin:auto;padding:40px 24px 80px}h1{font-size:36px;margin:0}h2{font-size:21px;margin:0}
.intro{color:#637266;margin:8px 0 30px}article{background:#fffefa;border:1px solid #d6ddd3;border-radius:10px;padding:22px;margin-top:18px}
header{border-bottom:1px solid #e4e8e0;padding-bottom:12px}.path{font-size:12px;overflow-wrap:anywhere}
a{color:#356e59}h3{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#647568;margin:20px 0 5px}
p{margin:0 0 10px;overflow-wrap:anywhere}.children{border-left:2px solid #b9ccb8;padding-left:20px;margin-top:20px}
.attention{border-left:4px solid #bf751f;background:#fff2d8;padding:1px 14px 8px;margin-top:16px}
@media(max-width:600px){main{padding:24px 12px}article{padding:14px}.children{padding-left:10px}}
</style><main><h1>Oasis</h1>
'''
    page += f'<p class="intro">Objective tree · {len(nodes)} objectives · Snapshot {now}<br>Regenerate this page after repository changes.</p>'
    page += "".join(render(directory) for directory in children[None]) + "</main></html>\n"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page, encoding="utf-8")
    return len(nodes)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[3], help="Repository root")
    parser.add_argument("--output", type=Path, help="Output HTML path (default: <root>/oasis.html)")
    parser.add_argument("--source", default="https://github.com/oasislaboratory/oasis/blob/main", help="Repository browser URL used for source and relative evidence links")
    args = parser.parse_args()
    root = args.root.resolve()
    output = (args.output or root / "oasis.html").resolve()
    try:
        count = export(root, output, args.source)
    except (OSError, ValueError) as error:
        parser.exit(1, f"Export failed: {error}\n")
    print(f"Exported {count} objectives to {output}")


if __name__ == "__main__":
    main()
