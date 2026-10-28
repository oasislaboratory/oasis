# Agent instructions

## Direction and authority

Read the root objective, README, selected objective, its ancestors, children, and linked dependencies. Preserve founder-authored objective text unless explicitly authorized to revise it. Keep communication concise.

The root is CEO, controlled by the founder. CIO owns graphlang/; CTO owns graphbrowser/; COO/CFO owns meta/. Further depths default to Upper Leadership, Senior Engineer, Junior Engineer, then Apprentice/Intern; deeper nodes retain Apprentice/Intern unless the founder defines another level. Titles describe responsibility, not separate people or automatically spawned agents.

Before writing, identify your assigned objective directory. Edit only files inside that directory and its descendants, including child objectives and local status logs. Read ancestors and siblings for context, but request their owner's changes through your local status log. A title or dependency link grants no additional write authority. Root/CEO assignment and edits to root AGENTS.md or README.md require explicit founder authorization; never infer root assignment from repository access. Existing children owned by other active agents require coordination before overlapping edits.

Graph Lang source/docs live in oasislaboratory/graph-lang. An assignment here does not itself grant write authority in another repository. This repository coordinates objectives and evidence across the three branches.

## Select and act

1. Within your assigned subtree, select the oldest unfinished, unblocked leaf by the Git commit that introduced its objective.md; break ties by path. A leaf has no child objective folders. Missing status means unfinished.
2. Estimate confidence in completing and verifying that leaf in one run. Record a short rationale; this is a judgment, not measured probability.
3. If confidence is at least 50%, execute the bounded work and verify the result.
4. Otherwise create two to four child folders, each with an objective.md and metadata. Each child should have >50% estimated confidence of being achievable through execution or further recursive decomposition. Explain why the set plausibly advances and covers the parent.
5. Intermediate objectives may require later decomposition. Children need not make the parent achievable in one subsequent run. Product-market fit requires longitudinal evidence.
6. Expand only the selected leaf in a run. Stop after decomposition; avoid speculative trees. If blocked, record the missing input and select another eligible leaf within your scope when possible.

## Objective metadata

Each objective.md starts with YAML fields:

- role: responsibility title for its depth.
- status: planned, in_progress, ongoing, blocked, completed, or cancelled.
- progress_percent: 0–100 estimate against explicit acceptance criteria; null when no defensible baseline exists.
- confidence_percent: 0–100 estimated chance of completing and verifying the stated next action in one run; null before assessment.
- assessed_by: actual model identifier if available, otherwise an honest agent label; null before assessment.
- assessed_on: assessment date in YYYY-MM-DD format; null before assessment.
- scope: repository-relative directory containing this objective.

Keep strategic mandates ongoing. Start bounded children planned; mark in_progress when work starts. Use blocked only for a concrete unmet prerequisite. Completed requires linked verification against the objective's acceptance criteria; cancelled means intentionally stopped.

Reassess percentages when working a node, with rationale and evidence in its local status.md. Distinguish estimated progress from next-action confidence. Do not invent precision, increase progress merely for creating children, or average child percentages without explicit weights and criteria. Continuing mandates can remain ongoing as individual milestones complete.

## Evidence and learning

Keep a brief status.md beside the selected objective: action assessed, confidence/progress rationale, result, verification links, and next dependency. objective.md metadata is the canonical current status; status.md supplies its supporting record. Distinguish plans, source inspection, tested behavior, and customer evidence. Parent owners reconcile their own status; child agents report evidence without editing ancestors.

For Meta experiments, define the hypothesis, baseline, variants, evaluation tasks, metric, budget, and stopping rule before running. Compare equivalent tasks under comparable budgets; record failures and cost as well as wins. Avoid selecting policies solely on their own self-reported scores.

Founder retains vision and veto authority. Surface consequential direction changes for a decision. Follow the current task's authorization for repository writes; an objective alone does not authorize external outreach or financial transactions.

Folder scope is an agent operating policy, not technical access enforcement. Do not claim GitHub prevents out-of-scope writes.
