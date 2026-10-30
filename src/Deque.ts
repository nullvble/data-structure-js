/**
 * Двусторонняя очередь (double-ended queue) на кольцевом буфере.
 * Вставка и удаление с обоих концов — амортизированно O(1), доступ по индексу — O(1).
 *
 * @example
 * ```ts
 * const deque = new Deque([2, 3]);
 * deque.pushFront(1).pushBack(4);
 * deque.popFront(); // 1
 * deque.at(-1); // 4
 * ```
 */
export class Deque<T> implements Iterable<T> {
  #buffer: (T | undefined)[];
  #head = 0;
  #size = 0;

  constructor(iterable: Iterable<T> = []) {
    this.#buffer = new Array(8);
    for (const value of iterable) this.pushBack(value);
  }

  /** Добавляет элемент в конец. */
  pushBack(value: T): this {
    if (this.#size === this.#buffer.length) this.#grow();
    this.#buffer[this.#index(this.#size)] = value;
    this.#size++;
    return this;
  }

  /** Добавляет элемент в начало. */
  pushFront(value: T): this {
    if (this.#size === this.#buffer.length) this.#grow();
    this.#head = (this.#head - 1 + this.#buffer.length) % this.#buffer.length;
    this.#buffer[this.#head] = value;
    this.#size++;
    return this;
  }

  /** Удаляет и возвращает последний элемент. */
  popBack(): T | undefined {
    if (this.#size === 0) return undefined;
    const i = this.#index(this.#size - 1);
    const value = this.#buffer[i];
    this.#buffer[i] = undefined;
    this.#size--;
    return value;
  }

  /** Удаляет и возвращает первый элемент. */
  popFront(): T | undefined {
    if (this.#size === 0) return undefined;
    const value = this.#buffer[this.#head];
    this.#buffer[this.#head] = undefined;
    this.#head = (this.#head + 1) % this.#buffer.length;
    this.#size--;
    return value;
  }

  peekFront(): T | undefined {
    return this.#size === 0 ? undefined : this.#buffer[this.#head];
  }

  peekBack(): T | undefined {
    return this.#size === 0 ? undefined : this.#buffer[this.#index(this.#size - 1)];
  }

  /** Элемент по индексу; отрицательный индекс считается с конца. */
  at(index: number): T | undefined {
    if (index < 0) index += this.#size;
    if (index < 0 || index >= this.#size) return undefined;
    return this.#buffer[this.#index(index)];
  }

  get size(): number {
    return this.#size;
  }

  isEmpty(): boolean {
    return this.#size === 0;
  }

  clear(): void {
    this.#buffer = new Array(8);
    this.#head = 0;
    this.#size = 0;
  }

  toArray(): T[] {
    return [...this];
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = 0; i < this.#size; i++) yield this.#buffer[this.#index(i)] as T;
  }

  #index(offset: number): number {
    return (this.#head + offset) % this.#buffer.length;
  }

  #grow(): void {
    const next: (T | undefined)[] = new Array(this.#buffer.length * 2);
    for (let i = 0; i < this.#size; i++) next[i] = this.#buffer[this.#index(i)];
    this.#buffer = next;
    this.#head = 0;
  }
}
