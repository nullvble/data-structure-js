/**
 * Дерево отрезков для произвольной ассоциативной операции (сумма, минимум, максимум, НОД…).
 * Изменение элемента и запрос на отрезке — O(log n), построение — O(n).
 * Операция не обязана быть коммутативной: порядок элементов сохраняется.
 *
 * Отрезки задаются полуинтервалом `[from, to)`, как в `Array#slice`.
 *
 * @example
 * ```ts
 * const tree = SegmentTree.min([5, 2, 8, 1, 9]);
 * tree.query(0, 3); // 2
 * tree.set(1, 7);
 * tree.query(0, 3); // 5
 * ```
 */
export class SegmentTree<T> {
  #tree: T[];
  readonly #n: number;
  readonly #combine: (a: T, b: T) => T;
  readonly #identity: T;

  /**
   * @param values Исходный массив.
   * @param combine Ассоциативная операция.
   * @param identity Нейтральный элемент операции (0 для суммы, `Infinity` для минимума…).
   */
  constructor(values: readonly T[], combine: (a: T, b: T) => T, identity: T) {
    const n = values.length;
    this.#n = n;
    this.#combine = combine;
    this.#identity = identity;
    this.#tree = new Array<T>(2 * n);
    for (let i = 0; i < n; i++) this.#tree[n + i] = values[i]!;
    for (let i = n - 1; i > 0; i--) this.#tree[i] = combine(this.#tree[2 * i]!, this.#tree[2 * i + 1]!);
  }

  /** Дерево для сумм. */
  static sum(values: readonly number[]): SegmentTree<number> {
    return new SegmentTree(values, (a, b) => a + b, 0);
  }

  /** Дерево для минимумов. */
  static min(values: readonly number[]): SegmentTree<number> {
    return new SegmentTree(values, Math.min, Infinity);
  }

  /** Дерево для максимумов. */
  static max(values: readonly number[]): SegmentTree<number> {
    return new SegmentTree(values, Math.max, -Infinity);
  }

  /** Результат операции на полуинтервале `[from, to)`. Для пустого отрезка — `identity`. */
  query(from = 0, to = this.#n): T {
    this.#checkRange(from, to);
    let left = this.#identity;
    let right = this.#identity;
    for (let l = from + this.#n, r = to + this.#n; l < r; l >>= 1, r >>= 1) {
      if (l & 1) left = this.#combine(left, this.#tree[l++]!);
      if (r & 1) right = this.#combine(this.#tree[--r]!, right);
    }
    return this.#combine(left, right);
  }

  /** Заменяет элемент по индексу. */
  set(index: number, value: T): void {
    this.#checkIndex(index);
    let i = index + this.#n;
    this.#tree[i] = value;
    for (i >>= 1; i > 0; i >>= 1) {
      this.#tree[i] = this.#combine(this.#tree[2 * i]!, this.#tree[2 * i + 1]!);
    }
  }

  /** Элемент по индексу. */
  get(index: number): T {
    this.#checkIndex(index);
    return this.#tree[index + this.#n]!;
  }

  get size(): number {
    return this.#n;
  }

  toArray(): T[] {
    return this.#tree.slice(this.#n, 2 * this.#n);
  }

  #checkIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.#n) {
      throw new RangeError(`Index ${index} out of bounds`);
    }
  }

  #checkRange(from: number, to: number): void {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to > this.#n || from > to) {
      throw new RangeError(`Invalid range [${from}, ${to})`);
    }
  }
}
