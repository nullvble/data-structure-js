/**
 * Двусторонняя очередь на кольцевом буфере.
 * Вставка и удаление с обоих концов — амортизированно O(1), доступ по индексу — O(1).
 */
export class Deque {
  #buffer;
  #head = 0;
  #size = 0;

  constructor(iterable = []) {
    this.#buffer = new Array(8);
    for (const value of iterable) this.pushBack(value);
  }

  pushBack(value) {
    if (this.#size === this.#buffer.length) this.#grow();
    this.#buffer[this.#index(this.#size)] = value;
    this.#size++;
    return this;
  }

  pushFront(value) {
    if (this.#size === this.#buffer.length) this.#grow();
    this.#head = (this.#head - 1 + this.#buffer.length) % this.#buffer.length;
    this.#buffer[this.#head] = value;
    this.#size++;
    return this;
  }

  popBack() {
    if (this.#size === 0) return undefined;
    const i = this.#index(this.#size - 1);
    const value = this.#buffer[i];
    this.#buffer[i] = undefined;
    this.#size--;
    return value;
  }

  popFront() {
    if (this.#size === 0) return undefined;
    const value = this.#buffer[this.#head];
    this.#buffer[this.#head] = undefined;
    this.#head = (this.#head + 1) % this.#buffer.length;
    this.#size--;
    return value;
  }

  peekFront() {
    return this.#size === 0 ? undefined : this.#buffer[this.#head];
  }

  peekBack() {
    return this.#size === 0 ? undefined : this.#buffer[this.#index(this.#size - 1)];
  }

  /** Элемент по индексу; отрицательный индекс считается с конца. */
  at(index) {
    if (index < 0) index += this.#size;
    if (index < 0 || index >= this.#size) return undefined;
    return this.#buffer[this.#index(index)];
  }

  get size() {
    return this.#size;
  }

  isEmpty() {
    return this.#size === 0;
  }

  clear() {
    this.#buffer = new Array(8);
    this.#head = 0;
    this.#size = 0;
  }

  toArray() {
    return [...this];
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.#size; i++) yield this.#buffer[this.#index(i)];
  }

  #index(offset) {
    return (this.#head + offset) % this.#buffer.length;
  }

  #grow() {
    const next = new Array(this.#buffer.length * 2);
    for (let i = 0; i < this.#size; i++) next[i] = this.#buffer[this.#index(i)];
    this.#buffer = next;
    this.#head = 0;
  }
}
