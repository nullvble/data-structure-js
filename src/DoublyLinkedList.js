class Node {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

/**
 * Двусвязный список. Вставка/удаление с обоих концов — O(1).
 * Методы push/unshift возвращают узел, который можно удалить за O(1) через removeNode.
 */
export class DoublyLinkedList {
  #head = null;
  #tail = null;
  #size = 0;

  constructor(iterable = []) {
    for (const value of iterable) this.push(value);
  }

  push(value) {
    const node = new Node(value);
    if (this.#tail) {
      node.prev = this.#tail;
      this.#tail.next = node;
    } else {
      this.#head = node;
    }
    this.#tail = node;
    this.#size++;
    return node;
  }

  unshift(value) {
    const node = new Node(value);
    if (this.#head) {
      node.next = this.#head;
      this.#head.prev = node;
    } else {
      this.#tail = node;
    }
    this.#head = node;
    this.#size++;
    return node;
  }

  pop() {
    return this.#tail ? this.removeNode(this.#tail) : undefined;
  }

  shift() {
    return this.#head ? this.removeNode(this.#head) : undefined;
  }

  /** Удаляет узел, принадлежащий этому списку, за O(1). */
  removeNode(node) {
    if (node.prev) node.prev.next = node.next;
    else this.#head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.#tail = node.prev;
    node.prev = node.next = null;
    this.#size--;
    return node.value;
  }

  /** Переносит существующий узел в начало списка. */
  moveToFront(node) {
    if (node === this.#head) return;
    this.removeNode(node);
    node.next = this.#head;
    if (this.#head) this.#head.prev = node;
    else this.#tail = node;
    this.#head = node;
    this.#size++;
  }

  get head() {
    return this.#head?.value;
  }

  get tail() {
    return this.#tail?.value;
  }

  get headNode() {
    return this.#head;
  }

  get tailNode() {
    return this.#tail;
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

  *reversed() {
    for (let node = this.#tail; node; node = node.prev) yield node.value;
  }
}
