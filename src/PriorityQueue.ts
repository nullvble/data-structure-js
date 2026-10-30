import { BinaryHeap } from './BinaryHeap.js';

interface Item<T> {
  value: T;
  priority: number;
  order: number;
}

/**
 * Очередь с приоритетом: первым извлекается элемент с наименьшим числом `priority`.
 * При равных приоритетах сохраняется порядок добавления (очередь стабильна).
 * `enqueue`/`dequeue` — O(log n).
 *
 * @example
 * ```ts
 * const pq = new PriorityQueue<string>();
 * pq.enqueue('низкий', 5).enqueue('срочно', 1);
 * pq.dequeue(); // 'срочно'
 * ```
 */
export class PriorityQueue<T> {
  #heap = new BinaryHeap<Item<T>>([], (a, b) => a.priority - b.priority || a.order - b.order);
  #counter = 0;

  enqueue(value: T, priority = 0): this {
    this.#heap.push({ value, priority, order: this.#counter++ });
    return this;
  }

  dequeue(): T | undefined {
    return this.#heap.pop()?.value;
  }

  peek(): T | undefined {
    return this.#heap.peek()?.value;
  }

  /** Приоритет элемента, который будет извлечён следующим. */
  peekPriority(): number | undefined {
    return this.#heap.peek()?.priority;
  }

  get size(): number {
    return this.#heap.size;
  }

  isEmpty(): boolean {
    return this.#heap.isEmpty();
  }

  clear(): void {
    this.#heap.clear();
    this.#counter = 0;
  }
}
