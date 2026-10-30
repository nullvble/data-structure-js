/**
 * Дерево Фенвика (Binary Indexed Tree) для префиксных сумм.
 * Прибавление к элементу и сумма на отрезке — O(log n), построение — O(n).
 * Компактнее и быстрее {@link SegmentTree}, но поддерживает только обратимые операции (сумму).
 *
 * Отрезки задаются полуинтервалом `[from, to)`.
 *
 * @example
 * ```ts
 * const sums = new FenwickTree([3, 1, 4, 1, 5]);
 * sums.rangeSum(1, 4); // 1 + 4 + 1 = 6
 * sums.add(2, 10);
 * sums.prefixSum(3); // 3 + 1 + 14 = 18
 * ```
 */
export class FenwickTree {
  #tree: Float64Array;

  /** @param sizeOrValues Длина массива из нулей или исходные значения. */
  constructor(sizeOrValues: number | readonly number[]) {
    if (typeof sizeOrValues === 'number') {
      if (!Number.isInteger(sizeOrValues) || sizeOrValues < 0) {
        throw new RangeError('Size must be a non-negative integer');
      }
      this.#tree = new Float64Array(sizeOrValues + 1);
      return;
    }
    const n = sizeOrValues.length;
    this.#tree = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) this.#tree[i + 1] = sizeOrValues[i]!;
    for (let i = 1; i <= n; i++) {
      const parent = i + (i & -i);
      if (parent <= n) this.#tree[parent]! += this.#tree[i]!;
    }
  }

  /** Прибавляет `delta` к элементу `index`. */
  add(index: number, delta: number): void {
    this.#checkIndex(index);
    for (let i = index + 1; i < this.#tree.length; i += i & -i) this.#tree[i]! += delta;
  }

  /** Устанавливает значение элемента. */
  set(index: number, value: number): void {
    this.add(index, value - this.get(index));
  }

  /** Значение элемента. */
  get(index: number): number {
    this.#checkIndex(index);
    return this.rangeSum(index, index + 1);
  }

  /** Сумма первых `count` элементов, то есть отрезка `[0, count)`. */
  prefixSum(count: number): number {
    if (!Number.isInteger(count) || count < 0 || count > this.size) {
      throw new RangeError(`Count ${count} out of bounds`);
    }
    let sum = 0;
    for (let i = count; i > 0; i -= i & -i) sum += this.#tree[i]!;
    return sum;
  }

  /** Сумма на полуинтервале `[from, to)`. */
  rangeSum(from: number, to: number): number {
    if (from > to) throw new RangeError(`Invalid range [${from}, ${to})`);
    return this.prefixSum(to) - this.prefixSum(from);
  }

  get size(): number {
    return this.#tree.length - 1;
  }

  toArray(): number[] {
    return Array.from({ length: this.size }, (_, i) => this.get(i));
  }

  #checkIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.size) {
      throw new RangeError(`Index ${index} out of bounds`);
    }
  }
}
