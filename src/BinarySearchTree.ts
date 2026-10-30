import { BinaryTree, type BinaryTreeNode } from './BinaryTree.js';
import { type Comparator, defaultCompare } from './comparator.js';

interface BSTNode<T> extends BinaryTreeNode<T> {}

/**
 * Несбалансированное двоичное дерево поиска (BST).
 * Операции — O(h), где h — высота дерева: O(log n) в среднем на случайных данных,
 * O(n) в худшем случае (например, при вставке отсортированной последовательности).
 * Для гарантированного O(log n) используйте {@link AVLTree} или {@link RedBlackTree}.
 *
 * @example
 * ```ts
 * const tree = new BinarySearchTree([8, 3, 10, 1, 6]);
 * tree.has(6); // true
 * [...tree]; // [1, 3, 6, 8, 10]
 * tree.floor(7); // 6
 *
 * const byAge = new BinarySearchTree<{ name: string; age: number }>([], (a, b) => a.age - b.age);
 * ```
 */
export class BinarySearchTree<T> extends BinaryTree<T, BSTNode<T>> {
  constructor(iterable: Iterable<T> = [], compare: Comparator<T> = defaultCompare) {
    super(compare);
    for (const value of iterable) this.insert(value);
  }

  insert(value: T): boolean {
    const node: BSTNode<T> = { value, left: null, right: null };
    if (!this.root) {
      this.root = node;
      this.count++;
      return true;
    }
    let current = this.root;
    while (true) {
      const cmp = this.compare(value, current.value);
      if (cmp === 0) return false;
      const side = cmp < 0 ? 'left' : 'right';
      const child = current[side];
      if (!child) {
        current[side] = node;
        this.count++;
        return true;
      }
      current = child;
    }
  }

  delete(value: T): boolean {
    const before = this.count;
    this.root = this.#deleteFrom(this.root, value);
    return this.count < before;
  }

  #deleteFrom(node: BSTNode<T> | null, value: T): BSTNode<T> | null {
    if (!node) return null;
    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      node.left = this.#deleteFrom(node.left, value);
      return node;
    }
    if (cmp > 0) {
      node.right = this.#deleteFrom(node.right, value);
      return node;
    }
    if (!node.left || !node.right) {
      this.count--;
      return node.left ?? node.right;
    }
    let successor = node.right;
    while (successor.left) successor = successor.left;
    node.value = successor.value;
    node.right = this.#deleteFrom(node.right, successor.value);
    return node;
  }
}
