/**
 * Стек (LIFO). Все операции — O(1).
 */
export class Stack {
  #items = [];

  constructor(iterable = []) {
    for (const value of iterable) this.push(value);
  }

  push(value) {
    this.#items.push(value);
    return this;
  }

  pop() {
    return this.#items.pop();
  }

  peek() {
    return this.#items[this.#items.length - 1];
  }

  get size() {
    return this.#items.length;
  }

  isEmpty() {
    return this.#items.length === 0;
  }

  clear() {
    this.#items = [];
  }

  toArray() {
    return [...this.#items].reverse();
  }

  /** Итерация от вершины к основанию. */
  *[Symbol.iterator]() {
    for (let i = this.#items.length - 1; i >= 0; i--) yield this.#items[i];
  }
}
