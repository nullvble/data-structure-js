/**
 * Стек (LIFO — «последним пришёл, первым ушёл»). Все операции — O(1).
 *
 * @example
 * ```ts
 * const stack = new Stack([1, 2]);
 * stack.push(3);
 * stack.pop(); // 3
 * stack.peek(); // 2
 * ```
 */
export class Stack<T> implements Iterable<T> {
  #items: T[] = [];

  constructor(iterable: Iterable<T> = []) {
    for (const value of iterable) this.push(value);
  }

  /** Кладёт элемент на вершину стека. */
  push(value: T): this {
    this.#items.push(value);
    return this;
  }

  /** Снимает и возвращает элемент с вершины; `undefined`, если стек пуст. */
  pop(): T | undefined {
    return this.#items.pop();
  }

  /** Возвращает вершину стека, не удаляя её. */
  peek(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  get size(): number {
    return this.#items.length;
  }

  isEmpty(): boolean {
    return this.#items.length === 0;
  }

  clear(): void {
    this.#items = [];
  }

  /** Элементы от вершины к основанию. */
  toArray(): T[] {
    return [...this.#items].reverse();
  }

  /** Итерация от вершины к основанию. */
  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = this.#items.length - 1; i >= 0; i--) yield this.#items[i] as T;
  }
}
