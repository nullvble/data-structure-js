/**
 * Словарь, в котором одному ключу соответствует несколько значений
 * (в порядке добавления). Удобен для группировки и индексов.
 *
 * @example
 * ```ts
 * const tags = new MultiMap<string, string>();
 * tags.add('js', 'post-1').add('js', 'post-2').add('ts', 'post-2');
 * tags.get('js'); // ['post-1', 'post-2']
 * tags.size; // 3
 * ```
 */
export class MultiMap<K, V> implements Iterable<[K, V]> {
  #map = new Map<K, V[]>();
  #size = 0;

  constructor(entries: Iterable<readonly [K, V]> = []) {
    for (const [key, value] of entries) this.add(key, value);
  }

  /** Создаёт MultiMap, группируя элементы по ключу. */
  static groupBy<K, T>(items: Iterable<T>, keyOf: (item: T) => K): MultiMap<K, T> {
    const map = new MultiMap<K, T>();
    for (const item of items) map.add(keyOf(item), item);
    return map;
  }

  /** Добавляет значение к ключу. */
  add(key: K, value: V): this {
    const values = this.#map.get(key);
    if (values) values.push(value);
    else this.#map.set(key, [value]);
    this.#size++;
    return this;
  }

  /** Все значения ключа (копия); пустой массив, если ключа нет. */
  get(key: K): V[] {
    return [...(this.#map.get(key) ?? [])];
  }

  has(key: K): boolean {
    return this.#map.has(key);
  }

  /** Есть ли у ключа данное значение (сравнение через `Object.is`). */
  hasEntry(key: K, value: V): boolean {
    return this.#map.get(key)?.some((v) => Object.is(v, value)) ?? false;
  }

  /** Количество значений у ключа. */
  count(key: K): number {
    return this.#map.get(key)?.length ?? 0;
  }

  /** Удаляет ключ со всеми значениями. */
  delete(key: K): boolean {
    const values = this.#map.get(key);
    if (!values) return false;
    this.#size -= values.length;
    return this.#map.delete(key);
  }

  /** Удаляет одно (первое) вхождение значения у ключа. */
  deleteEntry(key: K, value: V): boolean {
    const values = this.#map.get(key);
    const index = values?.findIndex((v) => Object.is(v, value)) ?? -1;
    if (index === -1) return false;
    values!.splice(index, 1);
    if (values!.length === 0) this.#map.delete(key);
    this.#size--;
    return true;
  }

  /** Общее количество значений. */
  get size(): number {
    return this.#size;
  }

  /** Количество различных ключей. */
  get keyCount(): number {
    return this.#map.size;
  }

  isEmpty(): boolean {
    return this.#size === 0;
  }

  clear(): void {
    this.#map.clear();
    this.#size = 0;
  }

  keys(): IterableIterator<K> {
    return this.#map.keys();
  }

  *values(): IterableIterator<V> {
    for (const values of this.#map.values()) yield* values;
  }

  /** Пары `[ключ, массив значений]`. */
  *groups(): IterableIterator<[K, V[]]> {
    for (const [key, values] of this.#map) yield [key, [...values]];
  }

  /** Плоские пары `[ключ, значение]`. */
  *entries(): IterableIterator<[K, V]> {
    for (const [key, values] of this.#map) for (const value of values) yield [key, value];
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
