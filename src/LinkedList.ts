interface ListNode<T> {
  value: T;
  next: ListNode<T> | null;
}

/**
 * Односвязный список.
 * Вставка в начало и в конец — O(1), удаление из начала — O(1),
 * доступ и вставка по индексу — O(n).
 *
 * @example
 * ```ts
 * const list = new LinkedList([1, 2, 4]);
 * list.insertAt(2, 3);
 * list.reverse().toArray(); // [4, 3, 2, 1]
 * ```
 */
export class LinkedList<T> implements Iterable<T> {
  #head: ListNode<T> | null = null;
  #tail: ListNode<T> | null = null;
  #size = 0;

  constructor(iterable: Iterable<T> = []) {
    for (const value of iterable) this.append(value);
  }

  /** Добавляет элемент в конец списка. */
  append(value: T): this {
    const node: ListNode<T> = { value, next: null };
    if (this.#tail) this.#tail.next = node;
    else this.#head = node;
    this.#tail = node;
    this.#size++;
    return this;
  }

  /** Добавляет элемент в начало списка. */
  prepend(value: T): this {
    this.#head = { value, next: this.#head };
    if (!this.#tail) this.#tail = this.#head;
    this.#size++;
    return this;
  }

  /**
   * Вставляет элемент так, чтобы он оказался на позиции `index`.
   * @throws RangeError, если `index` вне диапазона `[0, size]`.
   */
  insertAt(index: number, value: T): this {
    if (index < 0 || index > this.#size) throw new RangeError(`Index ${index} out of bounds`);
    if (index === 0) return this.prepend(value);
    if (index === this.#size) return this.append(value);
    const prev = this.#nodeAt(index - 1)!;
    prev.next = { value, next: prev.next };
    this.#size++;
    return this;
  }

  /** Элемент по индексу; `undefined`, если индекс вне диапазона. */
  get(index: number): T | undefined {
    return this.#nodeAt(index)?.value;
  }

  /** Удаляет и возвращает первый элемент. */
  removeFirst(): T | undefined {
    if (!this.#head) return undefined;
    const { value } = this.#head;
    this.#head = this.#head.next;
    if (!this.#head) this.#tail = null;
    this.#size--;
    return value;
  }

  /** Удаляет элемент по индексу и возвращает его. */
  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.#size) return undefined;
    if (index === 0) return this.removeFirst();
    const prev = this.#nodeAt(index - 1)!;
    const target = prev.next!;
    prev.next = target.next;
    if (!prev.next) this.#tail = prev;
    this.#size--;
    return target.value;
  }

  /** Удаляет первое вхождение значения. Возвращает `true`, если элемент был найден. */
  remove(value: T): boolean {
    const index = this.indexOf(value);
    if (index === -1) return false;
    this.removeAt(index);
    return true;
  }

  /** Индекс первого вхождения (сравнение через `Object.is`) или `-1`. */
  indexOf(value: T): number {
    let i = 0;
    for (let node = this.#head; node; node = node.next, i++) {
      if (Object.is(node.value, value)) return i;
    }
    return -1;
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  /** Разворачивает список на месте за O(n). */
  reverse(): this {
    let prev: ListNode<T> | null = null;
    let node = this.#head;
    this.#tail = node;
    while (node) {
      const next: ListNode<T> | null = node.next;
      node.next = prev;
      prev = node;
      node = next;
    }
    this.#head = prev;
    return this;
  }

  /** Первый элемент. */
  get head(): T | undefined {
    return this.#head?.value;
  }

  /** Последний элемент. */
  get tail(): T | undefined {
    return this.#tail?.value;
  }

  get size(): number {
    return this.#size;
  }

  isEmpty(): boolean {
    return this.#size === 0;
  }

  clear(): void {
    this.#head = this.#tail = null;
    this.#size = 0;
  }

  toArray(): T[] {
    return [...this];
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (let node = this.#head; node; node = node.next) yield node.value;
  }

  #nodeAt(index: number): ListNode<T> | null {
    if (index < 0 || index >= this.#size) return null;
    let node = this.#head!;
    for (let i = 0; i < index; i++) node = node.next!;
    return node;
  }
}
