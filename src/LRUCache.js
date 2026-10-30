import { DoublyLinkedList } from './DoublyLinkedList.js';

/**
 * Кэш с вытеснением давно не использованных элементов (Least Recently Used).
 * get/set/delete — O(1).
 */
export class LRUCache {
  #capacity;
  #map = new Map();
  #list = new DoublyLinkedList();

  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError('Capacity must be a positive integer');
    }
    this.#capacity = capacity;
  }

  get(key) {
    const node = this.#map.get(key);
    if (!node) return undefined;
    this.#list.moveToFront(node);
    return node.value.value;
  }

  /** Возвращает значение, не обновляя «свежесть» ключа. */
  peek(key) {
    return this.#map.get(key)?.value.value;
  }

  set(key, value) {
    const existing = this.#map.get(key);
    if (existing) {
      existing.value.value = value;
      this.#list.moveToFront(existing);
      return this;
    }
    if (this.#map.size === this.#capacity) {
      const evicted = this.#list.pop();
      this.#map.delete(evicted.key);
    }
    this.#map.set(key, this.#list.unshift({ key, value }));
    return this;
  }

  has(key) {
    return this.#map.has(key);
  }

  delete(key) {
    const node = this.#map.get(key);
    if (!node) return false;
    this.#list.removeNode(node);
    this.#map.delete(key);
    return true;
  }

  get size() {
    return this.#map.size;
  }

  get capacity() {
    return this.#capacity;
  }

  clear() {
    this.#map.clear();
    this.#list.clear();
  }

  /** Ключи от самого свежего к самому старому. */
  keys() {
    return [...this.#list].map((entry) => entry.key);
  }

  *[Symbol.iterator]() {
    for (const { key, value } of this.#list) yield [key, value];
  }
}
