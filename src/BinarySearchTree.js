import { defaultCompare } from './comparator.js';

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

/**
 * Несбалансированное двоичное дерево поиска.
 * Операции — O(h), где h — высота дерева (O(log n) в среднем, O(n) в худшем случае).
 * Для гарантированного O(log n) используйте AVLTree.
 */
export class BinarySearchTree {
  #compare;
  root = null;
  #size = 0;

  constructor(iterable = [], compare = defaultCompare) {
    this.#compare = compare;
    for (const value of iterable) this.insert(value);
  }

  /** Вставляет значение. Дубликаты игнорируются. Возвращает true, если значение добавлено. */
  insert(value) {
    const node = new Node(value);
    if (!this.root) {
      this.root = node;
      this.#size++;
      return true;
    }
    let current = this.root;
    while (true) {
      const cmp = this.#compare(value, current.value);
      if (cmp === 0) return false;
      const side = cmp < 0 ? 'left' : 'right';
      if (!current[side]) {
        current[side] = node;
        this.#size++;
        return true;
      }
      current = current[side];
    }
  }

  has(value) {
    let current = this.root;
    while (current) {
      const cmp = this.#compare(value, current.value);
      if (cmp === 0) return true;
      current = cmp < 0 ? current.left : current.right;
    }
    return false;
  }

  /** Удаляет значение. Возвращает true, если оно было в дереве. */
  delete(value) {
    const sizeBefore = this.#size;
    this.root = this.#deleteFrom(this.root, value);
    return this.#size < sizeBefore;
  }

  min() {
    let node = this.root;
    while (node?.left) node = node.left;
    return node?.value;
  }

  max() {
    let node = this.root;
    while (node?.right) node = node.right;
    return node?.value;
  }

  /** Наибольшее значение, не превышающее заданное. */
  floor(value) {
    let result;
    let node = this.root;
    while (node) {
      const cmp = this.#compare(value, node.value);
      if (cmp === 0) return node.value;
      if (cmp < 0) node = node.left;
      else {
        result = node.value;
        node = node.right;
      }
    }
    return result;
  }

  /** Наименьшее значение, не меньшее заданного. */
  ceil(value) {
    let result;
    let node = this.root;
    while (node) {
      const cmp = this.#compare(value, node.value);
      if (cmp === 0) return node.value;
      if (cmp > 0) node = node.right;
      else {
        result = node.value;
        node = node.left;
      }
    }
    return result;
  }

  height() {
    const h = (node) => (node ? 1 + Math.max(h(node.left), h(node.right)) : 0);
    return h(this.root);
  }

  get size() {
    return this.#size;
  }

  isEmpty() {
    return this.#size === 0;
  }

  clear() {
    this.root = null;
    this.#size = 0;
  }

  *inOrder(node = this.root) {
    if (!node) return;
    yield* this.inOrder(node.left);
    yield node.value;
    yield* this.inOrder(node.right);
  }

  *preOrder(node = this.root) {
    if (!node) return;
    yield node.value;
    yield* this.preOrder(node.left);
    yield* this.preOrder(node.right);
  }

  *postOrder(node = this.root) {
    if (!node) return;
    yield* this.postOrder(node.left);
    yield* this.postOrder(node.right);
    yield node.value;
  }

  *levelOrder() {
    if (!this.root) return;
    const queue = [this.root];
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i];
      yield node.value;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  toArray() {
    return [...this.inOrder()];
  }

  /** Итерация в отсортированном порядке. */
  [Symbol.iterator]() {
    return this.inOrder();
  }

  #deleteFrom(node, value) {
    if (!node) return null;
    const cmp = this.#compare(value, node.value);
    if (cmp < 0) {
      node.left = this.#deleteFrom(node.left, value);
      return node;
    }
    if (cmp > 0) {
      node.right = this.#deleteFrom(node.right, value);
      return node;
    }
    if (!node.left || !node.right) {
      this.#size--;
      return node.left ?? node.right;
    }
    let successor = node.right;
    while (successor.left) successor = successor.left;
    node.value = successor.value;
    node.right = this.#deleteFrom(node.right, successor.value);
    return node;
  }
}
