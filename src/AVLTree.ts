import { BinaryTree, type BinaryTreeNode } from './BinaryTree.js';
import { type Comparator, defaultCompare } from './comparator.js';

interface AVLNode<T> extends BinaryTreeNode<T> {
  height: number;
}

const heightOf = <T>(node: AVLNode<T> | null): number => (node ? node.height : 0);

function update<T>(node: AVLNode<T>): void {
  node.height = 1 + Math.max(heightOf(node.left), heightOf(node.right));
}

const balanceFactor = <T>(node: AVLNode<T>): number => heightOf(node.left) - heightOf(node.right);

function rotateRight<T>(node: AVLNode<T>): AVLNode<T> {
  const pivot = node.left!;
  node.left = pivot.right;
  pivot.right = node;
  update(node);
  update(pivot);
  return pivot;
}

function rotateLeft<T>(node: AVLNode<T>): AVLNode<T> {
  const pivot = node.right!;
  node.right = pivot.left;
  pivot.left = node;
  update(node);
  update(pivot);
  return pivot;
}

function rebalance<T>(node: AVLNode<T>): AVLNode<T> {
  update(node);
  const bf = balanceFactor(node);
  if (bf > 1) {
    if (balanceFactor(node.left!) < 0) node.left = rotateLeft(node.left!);
    return rotateRight(node);
  }
  if (bf < -1) {
    if (balanceFactor(node.right!) > 0) node.right = rotateRight(node.right!);
    return rotateLeft(node);
  }
  return node;
}

/**
 * Самобалансирующееся AVL-дерево: высоты поддеревьев любого узла отличаются
 * не более чем на 1. `insert`/`delete`/`has` — гарантированно O(log n).
 * Даёт чуть более быстрый поиск, чем {@link RedBlackTree}, за счёт более частых поворотов.
 *
 * @example
 * ```ts
 * const tree = new AVLTree([1, 2, 3, 4, 5, 6, 7]);
 * tree.height(); // 3 — несмотря на отсортированную вставку
 * ```
 */
export class AVLTree<T> extends BinaryTree<T, AVLNode<T>> {
  constructor(iterable: Iterable<T> = [], compare: Comparator<T> = defaultCompare) {
    super(compare);
    for (const value of iterable) this.insert(value);
  }

  insert(value: T): boolean {
    const before = this.count;
    this.root = this.#insertInto(this.root, value);
    return this.count > before;
  }

  delete(value: T): boolean {
    const before = this.count;
    this.root = this.#deleteFrom(this.root, value);
    return this.count < before;
  }

  /** Высота за O(1): хранится в корне. */
  override height(): number {
    return heightOf(this.root);
  }

  #insertInto(node: AVLNode<T> | null, value: T): AVLNode<T> {
    if (!node) {
      this.count++;
      return { value, left: null, right: null, height: 1 };
    }
    const cmp = this.compare(value, node.value);
    if (cmp === 0) return node;
    if (cmp < 0) node.left = this.#insertInto(node.left, value);
    else node.right = this.#insertInto(node.right, value);
    return rebalance(node);
  }

  #deleteFrom(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (!node) return null;
    const cmp = this.compare(value, node.value);
    if (cmp < 0) node.left = this.#deleteFrom(node.left, value);
    else if (cmp > 0) node.right = this.#deleteFrom(node.right, value);
    else {
      if (!node.left || !node.right) {
        this.count--;
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
