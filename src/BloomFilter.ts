import { BitSet } from './BitSet.js';

// FNV-1a (32 бита) с разными начальными значениями даёт две независимые хэш-функции.
function fnv1a(str: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  return hash >>> 0;
}

/**
 * Фильтр Блума — вероятностное множество, которое занимает очень мало памяти.
 * `mightContain` никогда не даёт ложноотрицательных ответов («точно нет»),
 * но с заданной вероятностью может дать ложноположительный («возможно, есть»).
 * Удалять элементы нельзя. `add`/`mightContain` — O(k), k — число хэш-функций.
 *
 * @example
 * ```ts
 * const seen = new BloomFilter(10_000, 0.01);
 * seen.add('https://example.com');
 * seen.mightContain('https://example.com'); // true
 * seen.mightContain('https://other.com'); // почти наверняка false
 * ```
 */
export class BloomFilter {
  #bits: BitSet;
  readonly #hashCount: number;
  #count = 0;

  /**
   * @param expectedItems Ожидаемое количество элементов.
   * @param falsePositiveRate Желаемая доля ложноположительных ответов, `(0, 1)`.
   */
  constructor(expectedItems: number, falsePositiveRate = 0.01) {
    if (!(expectedItems > 0)) throw new RangeError('expectedItems must be positive');
    if (!(falsePositiveRate > 0 && falsePositiveRate < 1)) {
      throw new RangeError('falsePositiveRate must be in (0, 1)');
    }
    const bits = Math.ceil((-expectedItems * Math.log(falsePositiveRate)) / Math.LN2 ** 2);
    this.#bits = new BitSet(bits);
    this.#hashCount = Math.max(1, Math.round((bits / expectedItems) * Math.LN2));
  }

  add(item: string | number): this {
    for (const index of this.#indices(item)) this.#bits.set(index);
    this.#count++;
    return this;
  }

  /** `false` — элемента точно нет; `true` — элемент, вероятно, есть. */
  mightContain(item: string | number): boolean {
    for (const index of this.#indices(item)) if (!this.#bits.has(index)) return false;
    return true;
  }

  /** Сколько раз вызывался `add`. */
  get count(): number {
    return this.#count;
  }

  /** Размер битового массива. */
  get bitCount(): number {
    return this.#bits.size;
  }

  /** Количество хэш-функций. */
  get hashCount(): number {
    return this.#hashCount;
  }

  /** Оценка текущей вероятности ложноположительного ответа. */
  estimatedFalsePositiveRate(): number {
    return (1 - Math.exp((-this.#hashCount * this.#count) / this.#bits.size)) ** this.#hashCount;
  }

  clear(): void {
    this.#bits.clear();
    this.#count = 0;
  }

  // Двойное хэширование (Кирш — Митценмахер): h_i = h1 + i·h2.
  *#indices(item: string | number): IterableIterator<number> {
    const str = String(item);
    const h1 = fnv1a(str, 0x811c9dc5);
    const h2 = fnv1a(str, 0x5bd1e995) | 1;
    const m = this.#bits.size;
    for (let i = 0; i < this.#hashCount; i++) yield ((h1 + Math.imul(i, h2)) >>> 0) % m;
  }
}
