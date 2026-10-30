import { Queue } from './Queue.js';
import { PriorityQueue } from './PriorityQueue.js';

/**
 * Граф на списках смежности. Поддерживает ориентированные и неориентированные,
 * взвешенные и невзвешенные графы.
 */
export class Graph {
  #adjacency = new Map();
  #directed;

  constructor({ directed = false } = {}) {
    this.#directed = directed;
  }

  get directed() {
    return this.#directed;
  }

  addVertex(v) {
    if (!this.#adjacency.has(v)) this.#adjacency.set(v, new Map());
    return this;
  }

  addEdge(from, to, weight = 1) {
    this.addVertex(from).addVertex(to);
    this.#adjacency.get(from).set(to, weight);
    if (!this.#directed) this.#adjacency.get(to).set(from, weight);
    return this;
  }

  removeEdge(from, to) {
    const removed = this.#adjacency.get(from)?.delete(to) ?? false;
    if (!this.#directed) this.#adjacency.get(to)?.delete(from);
    return removed;
  }

  removeVertex(v) {
    if (!this.#adjacency.delete(v)) return false;
    for (const edges of this.#adjacency.values()) edges.delete(v);
    return true;
  }

  hasVertex(v) {
    return this.#adjacency.has(v);
  }

  hasEdge(from, to) {
    return this.#adjacency.get(from)?.has(to) ?? false;
  }

  getWeight(from, to) {
    return this.#adjacency.get(from)?.get(to);
  }

  neighbors(v) {
    return [...(this.#adjacency.get(v)?.keys() ?? [])];
  }

  vertices() {
    return [...this.#adjacency.keys()];
  }

  get vertexCount() {
    return this.#adjacency.size;
  }

  get edgeCount() {
    let count = 0;
    for (const edges of this.#adjacency.values()) count += edges.size;
    return this.#directed ? count : count / 2;
  }

  /** Обход в ширину; возвращает вершины в порядке посещения. */
  bfs(start) {
    if (!this.hasVertex(start)) return [];
    const visited = new Set([start]);
    const order = [];
    const queue = new Queue([start]);
    while (!queue.isEmpty()) {
      const v = queue.dequeue();
      order.push(v);
      for (const next of this.#adjacency.get(v).keys()) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.enqueue(next);
        }
      }
    }
    return order;
  }

  /** Обход в глубину (итеративный); возвращает вершины в порядке посещения. */
  dfs(start) {
    if (!this.hasVertex(start)) return [];
    const visited = new Set();
    const order = [];
    const stack = [start];
    while (stack.length) {
      const v = stack.pop();
      if (visited.has(v)) continue;
      visited.add(v);
      order.push(v);
      const next = [...this.#adjacency.get(v).keys()].reverse();
      for (const n of next) if (!visited.has(n)) stack.push(n);
    }
    return order;
  }

  /**
   * Кратчайший путь алгоритмом Дейкстры (веса должны быть неотрицательными).
   * Возвращает { distance, path } или null, если путь не существует.
   */
  shortestPath(from, to) {
    if (!this.hasVertex(from) || !this.hasVertex(to)) return null;
    const dist = new Map([[from, 0]]);
    const prev = new Map();
    const done = new Set();
    const pq = new PriorityQueue().enqueue(from, 0);
    while (!pq.isEmpty()) {
      const v = pq.dequeue();
      if (done.has(v)) continue;
      done.add(v);
      if (v === to) break;
      for (const [next, w] of this.#adjacency.get(v)) {
        if (w < 0) throw new RangeError('Dijkstra does not support negative weights');
        const candidate = dist.get(v) + w;
        if (candidate < (dist.get(next) ?? Infinity)) {
          dist.set(next, candidate);
          prev.set(next, v);
          pq.enqueue(next, candidate);
        }
      }
    }
    if (!dist.has(to)) return null;
    const path = [to];
    while (path[0] !== from) path.unshift(prev.get(path[0]));
    return { distance: dist.get(to), path };
  }

  /**
   * Топологическая сортировка (алгоритм Кана) для ориентированного графа.
   * Бросает ошибку при наличии цикла.
   */
  topologicalSort() {
    if (!this.#directed) throw new Error('Topological sort requires a directed graph');
    const inDegree = new Map([...this.#adjacency.keys()].map((v) => [v, 0]));
    for (const edges of this.#adjacency.values()) {
      for (const to of edges.keys()) inDegree.set(to, inDegree.get(to) + 1);
    }
    const queue = new Queue([...inDegree].filter(([, d]) => d === 0).map(([v]) => v));
    const order = [];
    while (!queue.isEmpty()) {
      const v = queue.dequeue();
      order.push(v);
      for (const to of this.#adjacency.get(v).keys()) {
        inDegree.set(to, inDegree.get(to) - 1);
        if (inDegree.get(to) === 0) queue.enqueue(to);
      }
    }
    if (order.length !== this.#adjacency.size) throw new Error('Graph contains a cycle');
    return order;
  }

  hasCycle() {
    if (this.#directed) {
      try {
        this.topologicalSort();
        return false;
      } catch {
        return true;
      }
    }
    const visited = new Set();
    for (const start of this.#adjacency.keys()) {
      if (visited.has(start)) continue;
      const stack = [[start, undefined]];
      visited.add(start);
      while (stack.length) {
        const [v, parent] = stack.pop();
        for (const next of this.#adjacency.get(v).keys()) {
          if (next === parent) continue;
          if (visited.has(next)) return true;
          visited.add(next);
          stack.push([next, v]);
        }
      }
    }
    return false;
  }
}
