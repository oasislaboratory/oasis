# Scientific rounds

A persistent `objective.md` defines a problem (desired transformation), not a disposable agent chat. A round is a bounded attempt to improve its state. The graph remains the source of truth; rounds preserve the evidence of attempts.

## Procedure
1. Read the assigned objective and inherited `directives.md` from root to leaf.
2. Inspect previous rounds and current working state.
3. Identify a falsifiable hypothesis and specify a prediction **before** execution.
4. Propose the procedure, permitted paths/actions, resource budget, deadline or stopping condition, and evidence required.
5. Obtain authorization for the round and any external actions. Existing permission rules still apply.
6. Execute within the approved scope. Check for changes to objectives, directives, permissions, and relevant files before writing or committing; reconcile conflicts rather than overwrite.
7. Append observations and actual costs, separating evidence from interpretation. Never revise the original prediction to match the outcome.
8. Recommend continue, revise, fork, terminate, or escalate. A recommendation is not authorization for the next round.

## Storage
Keep the objective in its existing directory. Store each attempt in `rounds/NNN.md` under that directory. Each round is an append-only record after authorization; corrections are dated addenda. Do not delete unsuccessful attempts. Links to code, commits, artifacts, and external evidence should be included when available.

## Governance
Agents can decompose and fork working objectives within existing authority, but cannot change founder-protected intent, exceed budgets, or initiate unapproved external spending, publishing, or commitments. Instructions are not a security boundary: enforcement requires server-side checks. If authorization is missing, propose rather than execute.

## Allocation
Compare rounds by evidence, actual cost, expected benefit, risk, and value of information. Probability estimates are optional and must not be presented as calibrated without data. Allocation decisions are proposals until authorized. Continuous internal research may be considered later; production changes require tests and deliberate promotion.
