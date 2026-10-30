import { defaultCompare } from './comparator.js';

/**
 * Двоичная куча. По умолчанию — min-heap; для max-heap передайте (a, b) => b - a
 * или используйте MaxHeap. push/pop — O(log n), peek — O(1), построение из массива — O(n).
 */
export class BinaryHeap {
  #items = [];
  #compare;

  constructor(iterable = [], compare = defaultCompare) {
    this.#compare = compare;
    this.#items = [...iterable];
    for (let i = (this.#items.length >> 1) - 1; i >= 0; i--) this.#siftDown(i);
  }

  push(value) {
    this.#items.push(value);
    this.#siftUp(this.#items.length - 1);
    return this;
  }

  pop() {
    const items = this.#items;
    if (items.length === 0) return undefined;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  peek() {
    return this.#items[0];
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

  /** Элементы в порядке хранения (не отсортированы). */
  toArray() {
    return [...this.#items];
  }

  /** Возвращает все элементы в отсортированном порядке, не изменяя кучу. */
  toSortedArray() {
    return [...this.#items].sort(this.#compare);
  }

  [Symbol.iterator]() {
    return this.#items[Symbol.iterator]();
  }

  #siftUp(i) {
    const items = this.#items;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.#compare(items[i], items[parent]) >= 0) break;
      [items[i], items[parent]] = [items[parent], items[i]];
      i = parent;
    }
  }

  #siftDown(i) {
    const items = this.#items;
    const n = items.length;
    while (true) {
      const left = 2 * i + 1;
      const right = left + 1;
      let best = i;
      if (left < n && this.#compare(items[left], items[best]) < 0) best = left;
      if (right < n && this.#compare(items[right], items[best]) < 0) best = right;
      if (best === i) return;
      [items[i], items[best]] = [items[best], items[i]];
      i = best;
    }
  }
}

export class MinHeap extends BinaryHeap {
  constructor(iterable = []) {
    super(iterable, defaultCompare);
  }
}

export class MaxHeap extends BinaryHeap {
  constructor(iterable = []) {
    super(iterable, (a, b) => defaultCompare(b, a));
  }
}
