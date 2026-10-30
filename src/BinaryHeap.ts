import { type Comparator, defaultCompare, reverseCompare } from './comparator.js';

/**
 * Двоичная куча. На вершине всегда «наименьший» по компаратору элемент:
 * по умолчанию это min-heap, для max-heap передайте `(a, b) => b - a` или используйте {@link MaxHeap}.
 * `push`/`pop` — O(log n), `peek` — O(1), построение из коллекции — O(n).
 *
 * @example
 * ```ts
 * const tasks = new BinaryHeap<{ id: number; deadline: number }>([], (a, b) => a.deadline - b.deadline);
 * tasks.push({ id: 1, deadline: 30 }).push({ id: 2, deadline: 10 });
 * tasks.pop(); // { id: 2, deadline: 10 }
 * ```
 */
export class BinaryHeap<T> implements Iterable<T> {
  #items: T[];
  readonly #compare: Comparator<T>;

  constructor(iterable: Iterable<T> = [], compare: Comparator<T> = defaultCompare) {
    this.#compare = compare;
    this.#items = [...iterable];
    for (let i = (this.#items.length >> 1) - 1; i >= 0; i--) this.#siftDown(i);
  }

  /** Добавляет элемент. */
  push(value: T): this {
    this.#items.push(value);
    this.#siftUp(this.#items.length - 1);
    return this;
  }

  /** Извлекает вершину кучи. */
  pop(): T | undefined {
    const items = this.#items;
    if (items.length === 0) return undefined;
    const top = items[0];
    const last = items.pop()!;
    if (items.length > 0) {
      items[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  /** Добавляет элемент и сразу извлекает вершину — быстрее, чем `push` + `pop`. */
  pushPop(value: T): T {
    const items = this.#items;
    if (items.length === 0 || this.#compare(value, items[0]!) <= 0) return value;
    const top = items[0]!;
    items[0] = value;
    this.#siftDown(0);
    return top;
  }

  /** Вершина кучи без удаления. */
  peek(): T | undefined {
    return this.#items[0];
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

  /** Элементы в порядке хранения (не отсортированы). */
  toArray(): T[] {
    return [...this.#items];
  }

  /** Все элементы в порядке извлечения; куча не изменяется. */
  toSortedArray(): T[] {
    return [...this.#items].sort(this.#compare);
  }

  /** Итерация в порядке хранения (не отсортирована). */
  [Symbol.iterator](): IterableIterator<T> {
    return this.#items[Symbol.iterator]();
  }

  #siftUp(i: number): void {
    const items = this.#items;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.#compare(items[i]!, items[parent]!) >= 0) break;
      [items[i], items[parent]] = [items[parent]!, items[i]!];
      i = parent;
    }
  }

  #siftDown(i: number): void {
    const items = this.#items;
    const n = items.length;
    while (true) {
      const left = 2 * i + 1;
      const right = left + 1;
      let best = i;
      if (left < n && this.#compare(items[left]!, items[best]!) < 0) best = left;
      if (right < n && this.#compare(items[right]!, items[best]!) < 0) best = right;
      if (best === i) return;
      [items[i], items[best]] = [items[best]!, items[i]!];
      i = best;
    }
  }
}

/** Min-куча: на вершине наименьший элемент. */
export class MinHeap<T> extends BinaryHeap<T> {
  constructor(iterable: Iterable<T> = []) {
    super(iterable, defaultCompare);
  }
}

/** Max-куча: на вершине наибольший элемент. */
export class MaxHeap<T> extends BinaryHeap<T> {
  constructor(iterable: Iterable<T> = []) {
    super(iterable, reverseCompare<T>());
  }
}
