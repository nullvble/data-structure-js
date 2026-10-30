import { type Comparator, defaultCompare } from './comparator.js';

interface SkipNode<T> {
  value: T;
  next: (SkipNode<T> | null)[];
}

const MAX_LEVEL = 32;

/**
 * Список с пропусками (skip list) — вероятностная альтернатива сбалансированным деревьям.
 * Хранит уникальные значения в отсортированном порядке; `insert`/`delete`/`has` — O(log n)
 * в среднем. Проще в реализации, чем деревья, и хорошо подходит для конкурентных сценариев.
 *
 * @example
 * ```ts
 * const list = new SkipList([5, 1, 3]);
 * list.insert(2);
 * [...list]; // [1, 2, 3, 5]
 * [...list.range(2, 4)]; // [2, 3]
 * ```
 */
export class SkipList<T> implements Iterable<T> {
  #head: SkipNode<T>;
  #level = 1;
  #size = 0;
  readonly #compare: Comparator<T>;
  readonly #random: () => number;

  /**
   * @param random Источник случайных чисел в `[0, 1)`; можно подменить для детерминированных тестов.
   */
  constructor(iterable: Iterable<T> = [], compare: Comparator<T> = defaultCompare, random: () => number = Math.random) {
    this.#compare = compare;
    this.#random = random;
    this.#head = this.#createHead();
    for (const value of iterable) this.insert(value);
  }

  /** Вставляет значение. Дубликаты игнорируются. Возвращает `true`, если значение добавлено. */
  insert(value: T): boolean {
    const update = this.#findPredecessors(value);
    const candidate = update[0]!.next[0];
    if (candidate && this.#compare(candidate.value, value) === 0) return false;

    const level = this.#randomLevel();
    if (level > this.#level) {
      for (let i = this.#level; i < level; i++) update[i] = this.#head;
      this.#level = level;
    }
    const node: SkipNode<T> = { value, next: new Array(level) };
    for (let i = 0; i < level; i++) {
      node.next[i] = update[i]!.next[i] ?? null;
      update[i]!.next[i] = node;
    }
    this.#size++;
    return true;
  }

  /** Удаляет значение. Возвращает `true`, если оно было в списке. */
  delete(value: T): boolean {
    const update = this.#findPredecessors(value);
    const target = update[0]!.next[0];
    if (!target || this.#compare(target.value, value) !== 0) return false;
    for (let i = 0; i < this.#level; i++) {
      if (update[i]!.next[i] !== target) break;
      update[i]!.next[i] = target.next[i] ?? null;
    }
    while (this.#level > 1 && !this.#head.next[this.#level - 1]) this.#level--;
    this.#size--;
    return true;
  }

  has(value: T): boolean {
    const candidate = this.#findPredecessors(value)[0]!.next[0];
    return !!candidate && this.#compare(candidate.value, value) === 0;
  }

  min(): T | undefined {
    return this.#head.next[0]?.value;
  }

  max(): T | undefined {
    let node = this.#head;
    for (let i = this.#level - 1; i >= 0; i--) {
      while (node.next[i]) node = node.next[i]!;
    }
    return node === this.#head ? undefined : node.value;
  }

  /** Значения из отрезка `[low, high]` в порядке возрастания. */
  *range(low: T, high: T): IterableIterator<T> {
    let node = this.#findPredecessors(low)[0]!.next[0];
    while (node && this.#compare(node.value, high) <= 0) {
      yield node.value;
      node = node.next[0] ?? null;
    }
  }

  get size(): number {
    return this.#size;
  }

  isEmpty(): boolean {
    return this.#size === 0;
  }

  clear(): void {
    this.#head = this.#createHead();
    this.#level = 1;
    this.#size = 0;
  }

  toArray(): T[] {
    return [...this];
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (let node = this.#head.next[0]; node; node = node.next[0] ?? null) yield node.value;
  }

  // update[i] — последний узел на уровне i со значением меньше value.
  #findPredecessors(value: T): SkipNode<T>[] {
    const update: SkipNode<T>[] = new Array(MAX_LEVEL);
    let node = this.#head;
    for (let i = this.#level - 1; i >= 0; i--) {
      let next = node.next[i];
      while (next && this.#compare(next.value, value) < 0) {
        node = next;
        next = node.next[i];
      }
      update[i] = node;
    }
    return update;
  }

  #randomLevel(): number {
    let level = 1;
    while (level < MAX_LEVEL && this.#random() < 0.5) level++;
    return level;
  }

  #createHead(): SkipNode<T> {
    return { value: undefined as T, next: new Array(MAX_LEVEL).fill(null) };
  }
}
