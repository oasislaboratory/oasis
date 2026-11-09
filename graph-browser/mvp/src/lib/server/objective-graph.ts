import type { GraphEntry, GraphNeighborhood, GraphSource } from '../graph';
import type { Objective, Repository } from './repository';

type ObjectiveValue = Omit<Objective, 'children'>;
const OBJECTIVE = 'oasis:objective';
const CONTAINS = 'filesystem:contains';

function identity({ children: _children, ...value }: Objective): GraphEntry<ObjectiveValue> {
  return { source: value.path, target: value.path, type: OBJECTIVE, value };
}

/** Filesystem semantics live here; writes stay at Repository's trusted boundary. */
export function filesystemGraph(repository: Pick<Repository, 'node'>): GraphSource<ObjectiveValue> {
  return {
    async read(id) {
      const node = await repository.node(id);
      return {
        entry: identity(node),
        related: node.children.map(child => ({
          relationship: { source: node.path, target: child.path, type: CONTAINS, value: null },
          entry: identity(child)
        }))
      };
    }
  };
}

/** Explicit Oasis OS view: other relationship types are not child windows.
 * This is intentionally not a generic renderer or a source of write authority.
 */
export function objectiveView(graph: GraphNeighborhood<ObjectiveValue>): Objective {
  const objective = (entry: GraphEntry<ObjectiveValue>): Objective => {
    if (entry.type !== OBJECTIVE || entry.source !== entry.target || entry.value.path !== entry.source) {
      throw new Error('Expected an Oasis objective identity');
    }
    return { ...entry.value, children: [] };
  };
  const node = objective(graph.entry);
  for (const { relationship, entry } of graph.related) {
    if (relationship.type !== CONTAINS) continue;
    if (relationship.source !== graph.entry.source || relationship.target !== entry.source) {
      throw new Error('Invalid objective containment relationship');
    }
    node.children.push(objective(entry));
  }
  return node;
}
