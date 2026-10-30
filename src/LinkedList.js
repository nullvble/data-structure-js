class Node {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

/**
 * Односвязный список.
 * Вставка/удаление в начале — O(1), добавление в конец — O(1), доступ по индексу — O(n).
 */
export class LinkedList {
  #head = null;
  #tail = null;
  #size = 0;

  constructor(iterable = []) {
    for (const value of iterable) this.append(value);
  }

  append(value) {
    const node = new Node(value);
    if (this.#tail) this.#tail.next = node;
    else this.#head = node;
    this.#tail = node;
    this.#size++;
    return this;
  }

  prepend(value) {
    this.#head = new Node(value, this.#head);
    if (!this.#tail) this.#tail = this.#head;
    this.#size++;
    return this;
  }

  insertAt(index, value) {
    if (index < 0 || index > this.#size) throw new RangeError(`Index ${index} out of bounds`);
    if (index === 0) return this.prepend(value);
    if (index === this.#size) return this.append(value);
    const prev = this.#nodeAt(index - 1);
    prev.next = new Node(value, prev.next);
    this.#size++;
    return this;
  }

  get(index) {
    return this.#nodeAt(index)?.value;
  }

  removeFirst() {
    if (!this.#head) return undefined;
    const { value } = this.#head;
    this.#head = this.#head.next;
    if (!this.#head) this.#tail = null;
    this.#size--;
    return value;
  }

  removeAt(index) {
    if (index < 0 || index >= this.#size) return undefined;
    if (index === 0) return this.removeFirst();
    const prev = this.#nodeAt(index - 1);
    const { value } = prev.next;
    prev.next = prev.next.next;
    if (!prev.next) this.#tail = prev;
    this.#size--;
    return value;
  }

  /** Удаляет первое вхождение значения. Возвращает true, если элемент был найден. */
  remove(value) {
    const index = this.indexOf(value);
    if (index === -1) return false;
    this.removeAt(index);
    return true;
  }

  indexOf(value) {
    let i = 0;
    for (let node = this.#head; node; node = node.next, i++) {
      if (Object.is(node.value, value)) return i;
    }
    return -1;
  }

  includes(value) {
    return this.indexOf(value) !== -1;
  }

  reverse() {
    let prev = null;
    let node = this.#head;
    this.#tail = node;
    while (node) {
      const next = node.next;
      node.next = prev;
      prev = node;
      node = next;
    }
    this.#head = prev;
    return this;
  }

  get head() {
    return this.#head?.value;
  }

  get tail() {
    return this.#tail?.value;
  }

  get size() {
    return this.#size;
  }

  isEmpty() {
    return this.#size === 0;
  }

  clear() {
    this.#head = this.#tail = null;
    this.#size = 0;
  }

  toArray() {
    return [...this];
  }

  *[Symbol.iterator]() {
    for (let node = this.#head; node; node = node.next) yield node.value;
  }

  #nodeAt(index) {
    if (index < 0 || index >= this.#size) return null;
    let node = this.#head;
    for (let i = 0; i < index; i++) node = node.next;
    return node;
  }
}
