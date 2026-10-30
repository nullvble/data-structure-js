import { BinaryHeap } from './BinaryHeap.js';

/**
 * Очередь с приоритетом: элемент с наименьшим приоритетом извлекается первым.
 * При равных приоритетах сохраняется порядок добавления (стабильность).
 */
export class PriorityQueue {
  #heap;
  #counter = 0;

  constructor() {
    this.#heap = new BinaryHeap([], (a, b) => a.priority - b.priority || a.order - b.order);
  }

  enqueue(value, priority = 0) {
    this.#heap.push({ value, priority, order: this.#counter++ });
    return this;
  }

  dequeue() {
    return this.#heap.pop()?.value;
  }

  peek() {
    return this.#heap.peek()?.value;
  }

  peekPriority() {
    return this.#heap.peek()?.priority;
  }

  get size() {
    return this.#heap.size;
  }

  isEmpty() {
    return this.#heap.isEmpty();
  }

  clear() {
    this.#heap.clear();
    this.#counter = 0;
  }
}
