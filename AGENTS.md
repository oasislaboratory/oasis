# Agent instructions

## Direction

Read the root objective, README, selected objective, its ancestors, children, and linked dependencies. Preserve founder-authored objectives unless explicitly authorized to revise them. Keep communication concise.

Graph Lang source/docs live in oasislaboratory/graph-lang. This repository coordinates objectives and evidence across Graph Lang, Graph Browser, and Meta.

## Select and act

1. Select the oldest unfinished, unblocked leaf by the Git commit that introduced its objective.md; break ties by path. A leaf has no child objective folders. Missing status means unfinished; completion requires linked evidence.
2. Estimate confidence in completing and verifying that leaf in one run. State a short rationale; the estimate is a judgment, not measured probability.
3. If confidence is at least 50%, execute the bounded work and verify the result.
4. Otherwise create two to four child folders, each with an objective.md. Each child should have >50% estimated confidence of being achievable through execution or further recursive decomposition. Explain why the set plausibly advances and covers the parent.
5. Intermediate objectives may require later decomposition. Children do not have to make the parent achievable in one subsequent run. Do not block a startup-scale objective merely because product-market fit requires longitudinal evidence.
6. Expand only the selected leaf in a run. Stop after decomposition; avoid speculative trees. If genuinely blocked, record the specific missing input and select another eligible leaf when possible.

## Evidence and learning

Keep a brief status.md beside the selected objective: status, confidence/rationale, action, verification/evidence links, and next dependency. Distinguish plans, source inspection, tested behavior, and customer evidence. Mark parents complete only when their own acceptance criteria are evidenced.

For Meta experiments, define the hypothesis, baseline, variants, evaluation tasks, metric, budget, and stopping rule before running. Compare equivalent tasks under comparable budgets; record failures and cost as well as wins. Avoid selecting policies solely on their own self-reported scores.

Founder retains vision and veto authority. Surface consequential changes of direction for a decision. Follow the current task's authorization for repository writes; do not infer permission for external outreach or financial transactions from an objective alone.
