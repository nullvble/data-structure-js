/**
 * Кольцевой буфер фиксированной ёмкости. Когда буфер заполнен, `push`
 * перезаписывает самый старый элемент. Удобен для логов, скользящих окон
 * и истории последних N событий. Все операции — O(1).
 *
 * @example
 * ```ts
 * const last3 = new CircularBuffer<number>(3);
 * [1, 2, 3, 4].forEach((n) => last3.push(n));
 * last3.toArray(); // [2, 3, 4]
 * ```
 */
export class CircularBuffer<T> implements Iterable<T> {
  #buffer: (T | undefined)[];
  #head = 0;
  #size = 0;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError('Capacity must be a positive integer');
    }
    this.#buffer = new Array(capacity);
  }

  /**
   * Добавляет элемент в конец. Если буфер полон, вытесняет самый старый
   * элемент и возвращает его; иначе возвращает `undefined`.
   */
  push(value: T): T | undefined {
    const capacity = this.#buffer.length;
    if (this.#size < capacity) {
      this.#buffer[(this.#head + this.#size) % capacity] = value;
      this.#size++;
      return undefined;
    }
    const evicted = this.#buffer[this.#head];
    this.#buffer[this.#head] = value;
    this.#head = (this.#head + 1) % capacity;
    return evicted;
  }

  /** Удаляет и возвращает самый старый элемент. */
  shift(): T | undefined {
    if (this.#size === 0) return undefined;
    const value = this.#buffer[this.#head];
    this.#buffer[this.#head] = undefined;
    this.#head = (this.#head + 1) % this.#buffer.length;
    this.#size--;
    return value;
  }

  /** Удаляет и возвращает самый новый элемент. */
  pop(): T | undefined {
    if (this.#size === 0) return undefined;
    const i = (this.#head + this.#size - 1) % this.#buffer.length;
    const value = this.#buffer[i];
    this.#buffer[i] = undefined;
    this.#size--;
    return value;
  }

  /** Самый старый элемент. */
  peekFirst(): T | undefined {
    return this.at(0);
  }

  /** Самый новый элемент. */
  peekLast(): T | undefined {
    return this.at(-1);
  }

  /** Элемент по индексу (0 — самый старый); отрицательный индекс считается с конца. */
  at(index: number): T | undefined {
    if (index < 0) index += this.#size;
    if (index < 0 || index >= this.#size) return undefined;
    return this.#buffer[(this.#head + index) % this.#buffer.length];
  }

  get size(): number {
    return this.#size;
  }

  get capacity(): number {
    return this.#buffer.length;
  }

  isEmpty(): boolean {
    return this.#size === 0;
  }

  isFull(): boolean {
    return this.#size === this.#buffer.length;
  }

  clear(): void {
    this.#buffer = new Array(this.#buffer.length);
    this.#head = 0;
    this.#size = 0;
  }

  toArray(): T[] {
    return [...this];
  }

  /** Итерация от самого старого к самому новому. */
  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = 0; i < this.#size; i++) {
      yield this.#buffer[(this.#head + i) % this.#buffer.length] as T;
    }
  }
}
