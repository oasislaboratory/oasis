# Oasis domain map (transition)

The root philosophy and proposed structure are described in `proposals/way-of-oasis.md`. This map introduces four activity domains without changing protected founder-defined objectives or relocating working code.

| Domain | Existing work | Relationship |
| --- | --- | --- |
| Laboratory | Graph Lang research (to be implemented) | Semantics, experiments, textbook |
| Technology | `graph-browser/` | General graph interface, not identical to Oasis OS |
| Enterprise | `pmf/` | Demand tests and future ventures |
| Institution | `recursive-optimization/`, `protocol/` | Oasis OS, agent rounds, governance |

The filesystem tree is the current backing store for Oasis OS. Graph Browser should eventually render Graph Lang graph entries through a storage adapter. Typed edges may represent labels, causal assertions, permissions, flows, computations, or other relations. A semantic permission edge is not by itself an enforcement mechanism.

Migration rules: preserve all existing paths and live MVP behavior; do not silently change protected intent; seek founder approval for a specific root-objective diff; verify editing and scoped-write tests before moving code.
