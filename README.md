# Oasis

[Root objective](objective.md): cultivate this OKR DAG into a startup reaching product-market fit for its olog / graph browser / IDE.

| Role / branch | Responsibility |
| --- | --- |
| CIO / [Graph Lang](graphlang/objective.md) | Language, runtime, source, and documentation in the separate graph-lang repository. |
| CTO / [Graph Browser](graphbrowser/objective.md) | Hosted dashboard / IDE with Graph Lang execution and a persistent database/environment. |
| COO/CFO / [Meta](meta/objective.md) | The OKR DAG, agent portfolios, performance-based allocation, and experiments on the process itself. |

Each objective folder is a node. Nested objective folders are key results that can themselves be decomposed. Use relative Markdown links for cross-branch dependencies and shared results; do not duplicate work or introduce dependency cycles.

Read [AGENTS.md](AGENTS.md) before selecting or expanding work. These three branches are strategic objectives, not completed results or a claim that product-market fit is guaranteed.

## Roles and status

The root is CEO, controlled by the founder. CIO owns Graph Lang; CTO owns Graph Browser; COO/CFO owns Meta. Deeper objective folders represent Upper Leadership → Senior Engineer → Junior Engineer → Apprentice/Intern. These are responsibility levels; create them only when useful objectives require decomposition.

Every objective carries YAML metadata: `role`, `status`, `progress_percent`, `confidence_percent`, `assessed_by`, `assessed_on`, and `scope`. Current strategic objectives are `ongoing`; percentages are `null` until assessed against evidence and a bounded next action.

Status: `planned` → `in_progress` → `completed`; use `ongoing` for continuing mandates, `blocked` for a missing prerequisite, and `cancelled` for intentionally stopped work.

Agents may edit only their explicitly assigned objective folder and descendants. Ancestors and linked dependencies are readable; sibling changes go to their owner. Root/CEO assignment and shared policy changes require explicit founder authorization. This is an agent operating policy, not a GitHub permission boundary; technical isolation requires scoped tooling or separate review controls.
