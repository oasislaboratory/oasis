---
role: Upper Leadership
status: completed
progress_percent: 100
confidence_percent: null
assessed_by: "Codex (GPT-6; exact runtime identifier unavailable)"
assessed_on: "2026-10-28"
scope: "graphbrowser/01-workflow-contract/"
---

# Upper Leadership — Define a falsifiable OKR browser workflow

Specify the smallest useful Graph Browser increment using Oasis's OKR DAG as a concrete workflow. Produce a pinned, read-only input fixture and acceptance scenarios within this folder.

Acceptance criteria:
- Identify the initial user, task, and hypothesized benefit as assumptions to test, not established demand.
- Define graph/objective identity, parent/child and cross-dependency links, objective/status metadata, and preservation of source text for the fixture.
- Describe an end-to-end task: open the DAG, inspect a leaf and its evidence/dependencies, propose an edit, save it to a test environment, reload, and compare the result with the intended change.
- Specify deterministic pass/fail checks, malformed/missing-data behavior, and what an observed usability result would support or refute.
- Separate fixture/simulation acceptance from real runtime, durable storage, hosting, and customer validation. List required interfaces and unresolved decisions without committing to a provider.

Verification: [acceptance review](README.md), [contract](contract.md), and [offline check output](verification.json). All five specification/fixture criteria are satisfied; no UI, runtime, storage, or customer outcome is claimed. Pre-action confidence was 90%. Next handoff: implement and verify the editor prototype under its separate objective.
