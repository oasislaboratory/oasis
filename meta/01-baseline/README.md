# Initial observable baseline

Input: [Oasis 8adbbd4](https://github.com/oasislaboratory/oasis/tree/8adbbd44f71074907e717b747dcd07111ef5e1e8), assessed 2026-10-28. Frozen before this increment.

| Acceptance criterion | Artifact / verification |
| --- | --- |
| Run-record fields and unknown measurements | [schema](run-record.schema.json), [this run](run-record.json) |
| Initial pinned objectives/status/evidence | [source snapshot](source-snapshot.json), [extracted baseline](baseline.json) |
| Reproducible extraction and checks | [checker and actual results](verification/README.md) |
| Telemetry gaps and comparable collection | Collection protocol below |

The snapshot has 11 objectives: four ongoing mandates and seven planned children; two status logs; zero completed objectives. Both logs describe decomposition/planning. Their linked verification statements are not independently demonstrated product behavior. Evidence links are an index, not endorsements. The input snapshot is intentionally unchanged when this package is completed.

Source inspection only: linked Graph Lang default head was [6e57551](https://github.com/oasislaboratory/graph-lang/tree/6e575510ea5346dad35d75b41d4492b05ed75548); its README describes experimentation, and src/lib/graph.json contains a three-vertex adjacency fixture. No Graph Lang build/runtime was executed here. No customer evidence was collected.

## Collection protocol

1. For each future Meta run, copy the schema, pin input commit and exact task/acceptance criteria before execution, and record actual known model/configuration. Keep unavailable model details null or explicitly unavailable.
2. Record the bounded action, verification command/results, failures and rework, scoped changed paths, output commit, elapsed time, tokens and cost only where observed. Do not infer elapsed time from commit dates or treat null as zero. Separate raw outcomes from judgments.
3. For comparable experiment records, freeze protocol/task pairs, acceptance checks, model settings, budgets, allocation method, metrics and stopping rules first in 02-experiment-design. This baseline collection is not an A/B experiment; no variant has run.
4. Keep records under Meta. Read sibling evidence as context; do not change their files, prompts or schedules to collect telemetry. Ask owners via local status for optional existing verification records, never invent them.
5. Resolve this run's output commit using the commit containing run-record.json (Git history); output_commit is null in the embedded record to avoid a self-referential SHA. Publishing is separately verified by readback. Future follow-on records may fill a prior run's commit.

Current gaps: no reliable durations, token accounting, monetary cost, paired outcomes, rework history or customer observations. This run creates the first tested measurement artifact, not evidence of better allocation. No allocation change is recommended. Aggregate mandate progress remains null.

Reproduce from repository root:
```sh
python meta/01-baseline/verification/check_baseline.py
python meta/01-baseline/verification/check_baseline.py --extract
```

The offline checker compares frozen source texts and extracted rows; it does not authenticate GitHub provenance itself. The parent additionally compared every source text's Git blob hash with the pinned Git tree before publication. Simple YAML scalars/inline Markdown links are supported; richer YAML/Markdown needs an extractor revision.
