import { defaultCompare } from './comparator.js';

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

const height = (node) => (node ? node.height : 0);
const update = (node) => {
  node.height = 1 + Math.max(height(node.left), height(node.right));
};
const balanceFactor = (node) => height(node.left) - height(node.right);

function rotateRight(node) {
  const pivot = node.left;
  node.left = pivot.right;
  pivot.right = node;
  update(node);
  update(pivot);
  return pivot;
}

function rotateLeft(node) {
  const pivot = node.right;
  node.right = pivot.left;
  pivot.left = node;
  update(node);
  update(pivot);
  return pivot;
}

function rebalance(node) {
  update(node);
  const bf = balanceFactor(node);
  if (bf > 1) {
    if (balanceFactor(node.left) < 0) node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  if (bf < -1) {
    if (balanceFactor(node.right) > 0) node.right = rotateRight(node.right);
    return rotateLeft(node);
  }
  return node;
}

/**
 * Самобалансирующееся AVL-дерево. insert/delete/has — гарантированно O(log n).
 */
export class AVLTree {
  #compare;
  root = null;
  #size = 0;

  constructor(iterable = [], compare = defaultCompare) {
    this.#compare = compare;
    for (const value of iterable) this.insert(value);
  }

  /** Вставляет значение. Дубликаты игнорируются. Возвращает true, если значение добавлено. */
  insert(value) {
    const sizeBefore = this.#size;
    this.root = this.#insertInto(this.root, value);
    return this.#size > sizeBefore;
  }

  /** Удаляет значение. Возвращает true, если оно было в дереве. */
  delete(value) {
    const sizeBefore = this.#size;
    this.root = this.#deleteFrom(this.root, value);
    return this.#size < sizeBefore;
  }

  has(value) {
    let node = this.root;
    while (node) {
      const cmp = this.#compare(value, node.value);
      if (cmp === 0) return true;
      node = cmp < 0 ? node.left : node.right;
    }
    return false;
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

  height() {
    return height(this.root);
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

  toArray() {
    return [...this.inOrder()];
  }

  [Symbol.iterator]() {
    return this.inOrder();
  }

  #insertInto(node, value) {
    if (!node) {
      this.#size++;
      return new Node(value);
    }
    const cmp = this.#compare(value, node.value);
    if (cmp === 0) return node;
    if (cmp < 0) node.left = this.#insertInto(node.left, value);
    else node.right = this.#insertInto(node.right, value);
    return rebalance(node);
  }

  #deleteFrom(node, value) {
    if (!node) return null;
    const cmp = this.#compare(value, node.value);
    if (cmp < 0) node.left = this.#deleteFrom(node.left, value);
    else if (cmp > 0) node.right = this.#deleteFrom(node.right, value);
    else {
      if (!node.left || !node.right) {
        this.#size--;
        return node.left ?? node.right;
      }
      let successor = node.right;
      while (successor.left) successor = successor.left;
      node.value = successor.value;
      node.right = this.#deleteFrom(node.right, successor.value);
    }
    return rebalance(node);
  }
}
