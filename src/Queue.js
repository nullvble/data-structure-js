/**
 * Очередь (FIFO) на основе кольцевого буфера.
 * enqueue/dequeue — амортизированно O(1), в отличие от Array#shift (O(n)).
 */
export class Queue {
  #buffer;
  #head = 0;
  #size = 0;

  constructor(iterable = []) {
    this.#buffer = new Array(8);
    for (const value of iterable) this.enqueue(value);
  }

  enqueue(value) {
    if (this.#size === this.#buffer.length) this.#grow();
    this.#buffer[(this.#head + this.#size) % this.#buffer.length] = value;
    this.#size++;
    return this;
  }

  dequeue() {
    if (this.#size === 0) return undefined;
    const value = this.#buffer[this.#head];
    this.#buffer[this.#head] = undefined;
    this.#head = (this.#head + 1) % this.#buffer.length;
    this.#size--;
    return value;
  }

  peek() {
    return this.#size === 0 ? undefined : this.#buffer[this.#head];
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
    for (let i = 0; i < this.#size; i++) {
      yield this.#buffer[(this.#head + i) % this.#buffer.length];
    }
  }

  #grow() {
    const next = new Array(this.#buffer.length * 2);
    for (let i = 0; i < this.#size; i++) {
      next[i] = this.#buffer[(this.#head + i) % this.#buffer.length];
    }
    this.#buffer = next;
    this.#head = 0;
  }
}
