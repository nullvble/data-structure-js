import { RedBlackTree } from './RedBlackTree.js';
import { type Comparator, defaultCompare } from './comparator.js';

interface Entry<K, V> {
  key: K;
  value: V;
}

/**
 * Упорядоченный словарь на основе {@link RedBlackTree}. В отличие от встроенного `Map`,
 * хранит ключи отсортированными и поддерживает `floorKey`/`ceilKey`, `firstKey`/`lastKey`
 * и выборку по диапазону. Операции — O(log n).
 *
 * @example
 * ```ts
 * const prices = new SortedMap<number, string>([[300, 'c'], [100, 'a'], [200, 'b']]);
 * prices.firstKey(); // 100
 * prices.floorKey(250); // 200
 * [...prices.entriesBetween(150, 300)]; // [[200, 'b'], [300, 'c']]
 * ```
 */
export class SortedMap<K, V> implements Iterable<[K, V]> {
  #tree: RedBlackTree<Entry<K, V>>;

  constructor(entries: Iterable<readonly [K, V]> = [], compare: Comparator<K> = defaultCompare) {
    this.#tree = new RedBlackTree<Entry<K, V>>([], (a, b) => compare(a.key, b.key));
    for (const [key, value] of entries) this.set(key, value);
  }

  set(key: K, value: V): this {
    const existing = this.#tree.get(this.#probe(key));
    if (existing) existing.value = value;
    else this.#tree.insert({ key, value });
    return this;
  }

  get(key: K): V | undefined {
    return this.#tree.get(this.#probe(key))?.value;
  }

  has(key: K): boolean {
    return this.#tree.has(this.#probe(key));
  }

  delete(key: K): boolean {
    return this.#tree.delete(this.#probe(key));
  }

  /** Наименьший ключ. */
  firstKey(): K | undefined {
    return this.#tree.min()?.key;
  }

  /** Наибольший ключ. */
  lastKey(): K | undefined {
    return this.#tree.max()?.key;
  }

  /** Наибольший ключ, не превышающий `key`. */
  floorKey(key: K): K | undefined {
    return this.#tree.floor(this.#probe(key))?.key;
  }

  /** Наименьший ключ, не меньший `key`. */
  ceilKey(key: K): K | undefined {
    return this.#tree.ceil(this.#probe(key))?.key;
  }

  /** Наибольший ключ, строго меньший `key` (предыдущий ключ). */
  lowerKey(key: K): K | undefined {
    return this.#tree.lower(this.#probe(key))?.key;
  }

  /** Наименьший ключ, строго больший `key` (следующий ключ). */
  higherKey(key: K): K | undefined {
    return this.#tree.higher(this.#probe(key))?.key;
  }

  /** Пары с ключами из отрезка `[low, high]` в порядке возрастания ключей. */
  *entriesBetween(low: K, high: K): IterableIterator<[K, V]> {
    for (const { key, value } of this.#tree.range(this.#probe(low), this.#probe(high))) {
      yield [key, value];
    }
  }

  get size(): number {
    return this.#tree.size;
  }

  isEmpty(): boolean {
    return this.#tree.isEmpty();
  }

  clear(): void {
    this.#tree.clear();
  }

  *keys(): IterableIterator<K> {
    for (const entry of this.#tree) yield entry.key;
  }

  *values(): IterableIterator<V> {
    for (const entry of this.#tree) yield entry.value;
  }

  *entries(): IterableIterator<[K, V]> {
    for (const { key, value } of this.#tree) yield [key, value];
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  // Ключ-«зонд» для поиска: компаратор дерева смотрит только на key.
  #probe(key: K): Entry<K, V> {
    return { key } as Entry<K, V>;
  }
}
