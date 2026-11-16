# Graph-scoped execution — preparation package

Status: **design/preparation only, not launch-ready**. No model runs or API spend authorized.

From repository root (Node 24 and Git):

```sh
node --test institution/experiments/round-004/*.test.mjs
node institution/experiments/round-004/harness.mjs verify
```

`prepare.mjs` reproducibly exports tracked regular files from the pinned baseline and regenerates manifest/assignment. It resets human review/runtime fields to pending; do not run it over a reviewed final manifest. `harness.mjs freeze` intentionally creates a new candidate digest. Review diffs before replacing a freeze. `harness.mjs run` always fails closed.

Files:
- DESIGN.md: hypotheses, rubric, budget enforcement contract, stop/decision rules.
- manifest.json: six tasks, gold reference candidates, graph dependency edges, scopes, seeded 12-slot assignment.
- snapshot.json: immutable baseline export (generated; no environment or .git).
- harness.mjs: ancestry/dependency context assembly, isolated virtual file maps, trusted write broker, reference scoring and freeze verification.
- acceptance.mjs: independent sandbox checks for implementation and regression mutants; no host execution fallback.
- harness.test.mjs and controller.test.mjs: deterministic preparation tests, not agent outcomes.
- controller.mjs: authorization-gated sequencing, worst-case budget reservations, deadline/cancellation and logging contract; requires a separately validated provider adapter and durable logger.
- evidence/: preparation logs plus explicit unrun outcome placeholders.
- report.md: current evidence, limitations and proposed next change.

Only JSON tool requests cross from a future provider adapter into Broker.call. Provider must not receive object references, evaluate JavaScript or access the host. Broker.finish returns copies for the trusted evaluator/logger, never to another run. controller.mjs provides a trusted sequencing/deadline/reservation kernel with fake-provider tests. The provider-specific adapter, actual billing bounds, cancellation reconciliation, durable log sink and validated evaluator integration are **not implemented or validated for live use**. The kernel is not a launch-ready paid-execution orchestrator. Do not start a manual substitute trial and call it this experiment.

Before launch: human-review references; pin model/provider/settings/pricing and controller; validate bounded billing/cancellation and sandbox quotas; record approval and final freeze. See DESIGN.md. Runtime isolation currently fails in this environment; all experimental outcomes remain not_run.
