import { DoublyLinkedList, type DoublyLinkedListNode } from './DoublyLinkedList.js';

interface Entry<K, V> {
  key: K;
  value: V;
}

/**
 * Кэш с вытеснением давно не использованных записей (Least Recently Used).
 * При переполнении удаляется запись, к которой дольше всего не обращались.
 * `get`/`set`/`delete` — O(1).
 *
 * @example
 * ```ts
 * const cache = new LRUCache<string, number>(2);
 * cache.set('a', 1).set('b', 2);
 * cache.get('a');
 * cache.set('c', 3); // вытесняет 'b'
 * ```
 */
export class LRUCache<K, V> implements Iterable<[K, V]> {
  readonly #capacity: number;
  #map = new Map<K, DoublyLinkedListNode<Entry<K, V>>>();
  #list = new DoublyLinkedList<Entry<K, V>>();

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError('Capacity must be a positive integer');
    }
    this.#capacity = capacity;
  }

  /** Возвращает значение и помечает ключ как недавно использованный. */
  get(key: K): V | undefined {
    const node = this.#map.get(key);
    if (!node) return undefined;
    this.#list.moveToFront(node);
    return node.value.value;
  }

  /** Возвращает значение, не обновляя «свежесть» ключа. */
  peek(key: K): V | undefined {
    return this.#map.get(key)?.value.value;
  }

  set(key: K, value: V): this {
    const existing = this.#map.get(key);
    if (existing) {
      existing.value.value = value;
      this.#list.moveToFront(existing);
      return this;
    }
    if (this.#map.size === this.#capacity) {
      const evicted = this.#list.pop()!;
      this.#map.delete(evicted.key);
    }
    this.#map.set(key, this.#list.unshift({ key, value }));
    return this;
  }

  has(key: K): boolean {
    return this.#map.has(key);
  }

  delete(key: K): boolean {
    const node = this.#map.get(key);
    if (!node) return false;
    this.#list.removeNode(node);
    this.#map.delete(key);
    return true;
  }

  get size(): number {
    return this.#map.size;
  }

  get capacity(): number {
    return this.#capacity;
  }

  clear(): void {
    this.#map.clear();
    this.#list.clear();
  }

  /** Ключи от самого свежего к самому старому. */
  keys(): K[] {
    return [...this.#list].map((entry) => entry.key);
  }

  /** Пары `[ключ, значение]` от самой свежей к самой старой. */
  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (const { key, value } of this.#list) yield [key, value];
  }
}
