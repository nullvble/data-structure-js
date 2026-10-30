import { DisjointSet } from './DisjointSet.js';
import { PriorityQueue } from './PriorityQueue.js';
import { Queue } from './Queue.js';

/** Ребро графа: `[откуда, куда, вес]`. */
export type Edge<V> = [from: V, to: V, weight: number];

export interface GraphOptions {
  /** Ориентированный граф. По умолчанию `false`. */
  directed?: boolean;
}

export interface ShortestPath<V> {
  distance: number;
  path: V[];
}

export interface SpanningTree<V> {
  weight: number;
  edges: Edge<V>[];
}

/**
 * Граф на списках смежности: ориентированный или неориентированный, взвешенный или нет
 * (вес по умолчанию — 1). Вершинами могут быть любые значения, пригодные как ключи `Map`.
 *
 * @example
 * ```ts
 * const g = new Graph<string>()
 *   .addEdge('A', 'B', 4)
 *   .addEdge('A', 'C', 2)
 *   .addEdge('C', 'B', 1);
 * g.shortestPath('A', 'B'); // { distance: 3, path: ['A', 'C', 'B'] }
 * ```
 */
export class Graph<V = string> {
  #adjacency = new Map<V, Map<V, number>>();
  readonly #directed: boolean;

  constructor({ directed = false }: GraphOptions = {}) {
    this.#directed = directed;
  }

  get directed(): boolean {
    return this.#directed;
  }

  addVertex(v: V): this {
    if (!this.#adjacency.has(v)) this.#adjacency.set(v, new Map());
    return this;
  }

  /** Добавляет ребро (и недостающие вершины). Повторный вызов обновляет вес. */
  addEdge(from: V, to: V, weight = 1): this {
    this.addVertex(from).addVertex(to);
    this.#adjacency.get(from)!.set(to, weight);
    if (!this.#directed) this.#adjacency.get(to)!.set(from, weight);
    return this;
  }

  removeEdge(from: V, to: V): boolean {
    const removed = this.#adjacency.get(from)?.delete(to) ?? false;
    if (!this.#directed) this.#adjacency.get(to)?.delete(from);
    return removed;
  }

  /** Удаляет вершину и все инцидентные ей рёбра. */
  removeVertex(v: V): boolean {
    if (!this.#adjacency.delete(v)) return false;
    for (const edges of this.#adjacency.values()) edges.delete(v);
    return true;
  }

  hasVertex(v: V): boolean {
    return this.#adjacency.has(v);
  }

  hasEdge(from: V, to: V): boolean {
    return this.#adjacency.get(from)?.has(to) ?? false;
  }

  getWeight(from: V, to: V): number | undefined {
    return this.#adjacency.get(from)?.get(to);
  }

  neighbors(v: V): V[] {
    return [...(this.#adjacency.get(v)?.keys() ?? [])];
  }

  vertices(): V[] {
    return [...this.#adjacency.keys()];
  }

  /** Все рёбра. В неориентированном графе каждое ребро возвращается один раз. */
  edges(): Edge<V>[] {
    const result: Edge<V>[] = [];
    const seen = new Set<V>();
    for (const [from, edges] of this.#adjacency) {
      for (const [to, weight] of edges) {
        if (!this.#directed && seen.has(to)) continue;
        result.push([from, to, weight]);
      }
      seen.add(from);
    }
    return result;
  }

  get vertexCount(): number {
    return this.#adjacency.size;
  }

  get edgeCount(): number {
    return this.edges().length;
  }

  /** Обход в ширину; возвращает вершины в порядке посещения. */
  bfs(start: V): V[] {
    if (!this.hasVertex(start)) return [];
    const visited = new Set([start]);
    const order: V[] = [];
    const queue = new Queue([start]);
    while (!queue.isEmpty()) {
      const v = queue.dequeue()!;
      order.push(v);
      for (const next of this.#adjacency.get(v)!.keys()) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.enqueue(next);
        }
      }
    }
    return order;
  }

  /** Обход в глубину (итеративный, без риска переполнения стека). */
  dfs(start: V): V[] {
    if (!this.hasVertex(start)) return [];
    const visited = new Set<V>();
    const order: V[] = [];
    const stack = [start];
    while (stack.length) {
      const v = stack.pop()!;
      if (visited.has(v)) continue;
      visited.add(v);
      order.push(v);
      const next = [...this.#adjacency.get(v)!.keys()].reverse();
      for (const n of next) if (!visited.has(n)) stack.push(n);
    }
    return order;
  }

  /**
   * Кратчайший путь алгоритмом Дейкстры, O((V + E) log V).
   * @returns `null`, если путь не существует.
   * @throws RangeError при отрицательном весе ребра.
   */
  shortestPath(from: V, to: V): ShortestPath<V> | null {
    if (!this.hasVertex(from) || !this.hasVertex(to)) return null;
    const dist = new Map<V, number>([[from, 0]]);
    const prev = new Map<V, V>();
    const done = new Set<V>();
    const pq = new PriorityQueue<V>().enqueue(from, 0);
    while (!pq.isEmpty()) {
      const v = pq.dequeue()!;
      if (done.has(v)) continue;
      done.add(v);
      if (v === to) break;
      for (const [next, w] of this.#adjacency.get(v)!) {
        if (w < 0) throw new RangeError('Dijkstra does not support negative weights');
        const candidate = dist.get(v)! + w;
        if (candidate < (dist.get(next) ?? Infinity)) {
          dist.set(next, candidate);
          prev.set(next, v);
          pq.enqueue(next, candidate);
        }
      }
    }
    if (!dist.has(to)) return null;
    const path = [to];
    while (path[0] !== from) path.unshift(prev.get(path[0]!)!);
    return { distance: dist.get(to)!, path };
  }

  /**
   * Топологическая сортировка (алгоритм Кана) для ориентированного графа.
   * @throws Error, если граф неориентированный или содержит цикл.
   */
  topologicalSort(): V[] {
    if (!this.#directed) throw new Error('Topological sort requires a directed graph');
    const inDegree = new Map<V, number>([...this.#adjacency.keys()].map((v) => [v, 0]));
    for (const edges of this.#adjacency.values()) {
      for (const to of edges.keys()) inDegree.set(to, inDegree.get(to)! + 1);
    }
    const queue = new Queue([...inDegree].filter(([, d]) => d === 0).map(([v]) => v));
    const order: V[] = [];
    while (!queue.isEmpty()) {
      const v = queue.dequeue()!;
      order.push(v);
      for (const to of this.#adjacency.get(v)!.keys()) {
        inDegree.set(to, inDegree.get(to)! - 1);
        if (inDegree.get(to) === 0) queue.enqueue(to);
      }
    }
    if (order.length !== this.#adjacency.size) throw new Error('Graph contains a cycle');
    return order;
  }

  /** Есть ли в графе цикл. */
  hasCycle(): boolean {
    if (this.#directed) {
      try {
        this.topologicalSort();
        return false;
      } catch {
        return true;
      }
    }
    const visited = new Set<V>();
    for (const start of this.#adjacency.keys()) {
      if (visited.has(start)) continue;
      const stack: [V, V | undefined][] = [[start, undefined]];
      visited.add(start);
      while (stack.length) {
        const [v, parent] = stack.pop()!;
        for (const next of this.#adjacency.get(v)!.keys()) {
          if (next === parent) continue;
          if (visited.has(next)) return true;
          visited.add(next);
          stack.push([next, v]);
        }
      }
    }
    return false;
  }

  /**
   * Компоненты связности. Для ориентированного графа — компоненты слабой связности
   * (направление рёбер не учитывается).
   */
  connectedComponents(): V[][] {
    const ds = new DisjointSet(this.#adjacency.keys());
    for (const [from, to] of this.edges()) ds.union(from, to);
    return ds.groups();
  }

  /**
   * Минимальное остовное дерево (лес) алгоритмом Краскала, O(E log E).
   * @throws Error для ориентированного графа.
   */
  minimumSpanningTree(): SpanningTree<V> {
    if (this.#directed) throw new Error('Minimum spanning tree requires an undirected graph');
    const ds = new DisjointSet(this.#adjacency.keys());
    const edges: Edge<V>[] = [];
    let weight = 0;
    for (const edge of this.edges().sort((a, b) => a[2] - b[2])) {
      if (ds.union(edge[0], edge[1])) {
        edges.push(edge);
        weight += edge[2];
      }
    }
    return { weight, edges };
  }
}
