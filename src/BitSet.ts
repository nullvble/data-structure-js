function popcount(x: number): number {
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

/**
 * Битовое множество фиксированного размера: компактно хранит набор
 * неотрицательных целых чисел `[0, size)` — по одному биту на число.
 * `set`/`has`/`unset` — O(1), операции над множествами — O(size / 32).
 *
 * @example
 * ```ts
 * const flags = new BitSet(100);
 * flags.set(3).set(42);
 * flags.has(42); // true
 * flags.count(); // 2
 * [...flags]; // [3, 42]
 * ```
 */
export class BitSet implements Iterable<number> {
  #words: Uint32Array;
  readonly #size: number;

  constructor(size: number) {
    if (!Number.isInteger(size) || size < 0) throw new RangeError('Size must be a non-negative integer');
    this.#size = size;
    this.#words = new Uint32Array(Math.ceil(size / 32));
  }

  /** Создаёт множество из перечисленных индексов. */
  static from(indices: Iterable<number>, size: number): BitSet {
    const set = new BitSet(size);
    for (const i of indices) set.set(i);
    return set;
  }

  /** Устанавливает бит (или сбрасывает, если `value === false`). */
  set(index: number, value = true): this {
    this.#check(index);
    if (value) this.#words[index >>> 5]! |= 1 << (index & 31);
    else this.#words[index >>> 5]! &= ~(1 << (index & 31));
    return this;
  }

  /** Сбрасывает бит. */
  unset(index: number): this {
    return this.set(index, false);
  }

  /** Инвертирует бит. */
  toggle(index: number): this {
    this.#check(index);
    this.#words[index >>> 5]! ^= 1 << (index & 31);
    return this;
  }

  has(index: number): boolean {
    this.#check(index);
    return (this.#words[index >>> 5]! & (1 << (index & 31))) !== 0;
  }

  /** Количество установленных битов. */
  count(): number {
    let total = 0;
    for (const word of this.#words) total += popcount(word);
    return total;
  }

  /** Ёмкость множества в битах. */
  get size(): number {
    return this.#size;
  }

  isEmpty(): boolean {
    return this.#words.every((word) => word === 0);
  }

  clear(): void {
    this.#words.fill(0);
  }

  /** Новое множество — объединение (OR). */
  union(other: BitSet): BitSet {
    return this.#combine(other, (a, b) => a | b);
  }

  /** Новое множество — пересечение (AND). */
  intersection(other: BitSet): BitSet {
    return this.#combine(other, (a, b) => a & b);
  }

  /** Новое множество — разность (AND NOT). */
  difference(other: BitSet): BitSet {
    return this.#combine(other, (a, b) => a & ~b);
  }

  clone(): BitSet {
    const copy = new BitSet(this.#size);
    copy.#words.set(this.#words);
    return copy;
  }

  /** Индексы установленных битов по возрастанию. */
  toArray(): number[] {
    return [...this];
  }

  *[Symbol.iterator](): IterableIterator<number> {
    for (let w = 0; w < this.#words.length; w++) {
      let word = this.#words[w]!;
      while (word !== 0) {
        const bit = 31 - Math.clz32(word & -word);
        yield w * 32 + bit;
        word &= word - 1;
      }
    }
  }

  #combine(other: BitSet, op: (a: number, b: number) => number): BitSet {
    if (other.#size !== this.#size) throw new RangeError('BitSets must have the same size');
    const result = new BitSet(this.#size);
    for (let i = 0; i < this.#words.length; i++) result.#words[i] = op(this.#words[i]!, other.#words[i]!);
    return result;
  }

  #check(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.#size) {
      throw new RangeError(`Index ${index} out of bounds`);
    }
  }
}
