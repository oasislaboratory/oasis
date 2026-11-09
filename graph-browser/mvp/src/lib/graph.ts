/** A read boundary, not a Graph Lang runtime or a permission system.
 * IDs are opaque to consumers. Equal endpoints denote a diagonal identity.
 * Value may contain recursive data; this interface does not evaluate it.
 */
export type GraphEntry<Value = unknown> = {
  source: string;
  target: string;
  type: string;
  value: Value;
};

/** One bounded neighborhood. Arrays preserve parallel typed relationships.
 * Sources choose which relationships to expose; consumers must not assume
 * containment, a tree, unique targets, or recursively expand cycles.
 */
export type GraphNeighborhood<Value = unknown> = {
  entry: GraphEntry<Value>;
  related: { relationship: GraphEntry; entry: GraphEntry<Value> }[];
};

export interface GraphSource<Value = unknown> {
  read(id: string): Promise<GraphNeighborhood<Value>>;
}
