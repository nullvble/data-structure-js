/** Узел двусвязного списка. Возвращается из `push`/`unshift` для удаления за O(1). */
export interface DoublyLinkedListNode<T> {
  value: T;
  prev: DoublyLinkedListNode<T> | null;
  next: DoublyLinkedListNode<T> | null;
}

/**
 * Двусвязный список. Вставка и удаление с обоих концов — O(1).
 * Методы `push`/`unshift` возвращают узел, который затем можно удалить
 * или переместить за O(1) через `removeNode`/`moveToFront`.
 *
 * @example
 * ```ts
 * const list = new DoublyLinkedList([1, 2]);
 * const node = list.push(3);
 * list.moveToFront(node);
 * list.toArray(); // [3, 1, 2]
 * ```
 */
export class DoublyLinkedList<T> implements Iterable<T> {
  #head: DoublyLinkedListNode<T> | null = null;
  #tail: DoublyLinkedListNode<T> | null = null;
  #size = 0;

  constructor(iterable: Iterable<T> = []) {
    for (const value of iterable) this.push(value);
  }

  /** Добавляет элемент в конец и возвращает созданный узел. */
  push(value: T): DoublyLinkedListNode<T> {
    const node: DoublyLinkedListNode<T> = { value, prev: this.#tail, next: null };
    if (this.#tail) this.#tail.next = node;
    else this.#head = node;
    this.#tail = node;
    this.#size++;
    return node;
  }

  /** Добавляет элемент в начало и возвращает созданный узел. */
  unshift(value: T): DoublyLinkedListNode<T> {
    const node: DoublyLinkedListNode<T> = { value, prev: null, next: this.#head };
    if (this.#head) this.#head.prev = node;
    else this.#tail = node;
    this.#head = node;
    this.#size++;
    return node;
  }

  /** Удаляет и возвращает последний элемент. */
  pop(): T | undefined {
    return this.#tail ? this.removeNode(this.#tail) : undefined;
  }

  /** Удаляет и возвращает первый элемент. */
  shift(): T | undefined {
    return this.#head ? this.removeNode(this.#head) : undefined;
  }

  /** Удаляет узел, принадлежащий этому списку, за O(1). */
  removeNode(node: DoublyLinkedListNode<T>): T {
    if (node.prev) node.prev.next = node.next;
    else this.#head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.#tail = node.prev;
    node.prev = node.next = null;
    this.#size--;
    return node.value;
  }

  /** Переносит узел этого списка в начало за O(1). */
  moveToFront(node: DoublyLinkedListNode<T>): void {
    if (node === this.#head) return;
    this.removeNode(node);
    node.next = this.#head;
    if (this.#head) this.#head.prev = node;
    else this.#tail = node;
    this.#head = node;
    this.#size++;
  }

  get head(): T | undefined {
    return this.#head?.value;
  }

  get tail(): T | undefined {
    return this.#tail?.value;
  }

  get headNode(): DoublyLinkedListNode<T> | null {
    return this.#head;
  }

  get tailNode(): DoublyLinkedListNode<T> | null {
    return this.#tail;
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

  /** Итерация от конца к началу. */
  *reversed(): IterableIterator<T> {
    for (let node = this.#tail; node; node = node.prev) yield node.value;
  }
}
