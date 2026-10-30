/**
 * Очередь (FIFO — «первым пришёл, первым ушёл») на кольцевом буфере.
 * `enqueue`/`dequeue` — амортизированно O(1), в отличие от `Array#shift` (O(n)).
 *
 * @example
 * ```ts
 * const queue = new Queue(['a', 'b']);
 * queue.enqueue('c');
 * queue.dequeue(); // 'a'
 * ```
 */
export class Queue<T> implements Iterable<T> {
  #buffer: (T | undefined)[];
  #head = 0;
  #size = 0;

  constructor(iterable: Iterable<T> = []) {
    this.#buffer = new Array(8);
    for (const value of iterable) this.enqueue(value);
  }

  /** Добавляет элемент в конец очереди. */
  enqueue(value: T): this {
    if (this.#size === this.#buffer.length) this.#grow();
    this.#buffer[(this.#head + this.#size) % this.#buffer.length] = value;
    this.#size++;
    return this;
  }

  /** Извлекает элемент из начала очереди; `undefined`, если очередь пуста. */
  dequeue(): T | undefined {
    if (this.#size === 0) return undefined;
    const value = this.#buffer[this.#head];
    this.#buffer[this.#head] = undefined;
    this.#head = (this.#head + 1) % this.#buffer.length;
    this.#size--;
    return value;
  }

  /** Первый элемент очереди без удаления. */
  peek(): T | undefined {
    return this.#size === 0 ? undefined : this.#buffer[this.#head];
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
    for (let i = 0; i < this.#size; i++) {
      yield this.#buffer[(this.#head + i) % this.#buffer.length] as T;
    }
  }

  #grow(): void {
    const next: (T | undefined)[] = new Array(this.#buffer.length * 2);
    for (let i = 0; i < this.#size; i++) {
      next[i] = this.#buffer[(this.#head + i) % this.#buffer.length];
    }
    this.#buffer = next;
    this.#head = 0;
  }
}
