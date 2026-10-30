import { BinaryTree, type BinaryTreeNode } from './BinaryTree.js';
import { type Comparator, defaultCompare } from './comparator.js';

interface RBNode<T> extends BinaryTreeNode<T> {
  red: boolean;
}

const isRed = <T>(node: RBNode<T> | null): boolean => node !== null && node.red;

function rotateLeft<T>(h: RBNode<T>): RBNode<T> {
  const x = h.right!;
  h.right = x.left;
  x.left = h;
  x.red = h.red;
  h.red = true;
  return x;
}

function rotateRight<T>(h: RBNode<T>): RBNode<T> {
  const x = h.left!;
  h.left = x.right;
  x.right = h;
  x.red = h.red;
  h.red = true;
  return x;
}

function flipColors<T>(h: RBNode<T>): void {
  h.red = !h.red;
  h.left!.red = !h.left!.red;
  h.right!.red = !h.right!.red;
}

function fixUp<T>(h: RBNode<T>): RBNode<T> {
  if (isRed(h.right) && !isRed(h.left)) h = rotateLeft(h);
  if (isRed(h.left) && isRed(h.left!.left)) h = rotateRight(h);
  if (isRed(h.left) && isRed(h.right)) flipColors(h);
  return h;
}

function moveRedLeft<T>(h: RBNode<T>): RBNode<T> {
  flipColors(h);
  if (isRed(h.right!.left)) {
    h.right = rotateRight(h.right!);
    h = rotateLeft(h);
    flipColors(h);
  }
  return h;
}

function moveRedRight<T>(h: RBNode<T>): RBNode<T> {
  flipColors(h);
  if (isRed(h.left!.left)) {
    h = rotateRight(h);
    flipColors(h);
  }
  return h;
}

function deleteMin<T>(h: RBNode<T>): RBNode<T> | null {
  if (!h.left) return null;
  if (!isRed(h.left) && !isRed(h.left.left)) h = moveRedLeft(h);
  h.left = deleteMin(h.left!);
  return fixUp(h);
}

/**
 * Красно-чёрное дерево (левостороннее, LLRB по Седжвику).
 * Высота не превышает 2·log₂(n), `insert`/`delete`/`has` — O(log n).
 * По сравнению с {@link AVLTree} делает меньше поворотов при изменениях.
 *
 * @example
 * ```ts
 * const tree = new RedBlackTree<string>();
 * tree.insert('banana');
 * tree.insert('apple');
 * [...tree.range('a', 'b')]; // ['apple']
 * ```
 */
export class RedBlackTree<T> extends BinaryTree<T, RBNode<T>> {
  constructor(iterable: Iterable<T> = [], compare: Comparator<T> = defaultCompare) {
    super(compare);
    for (const value of iterable) this.insert(value);
  }

  insert(value: T): boolean {
    const before = this.count;
    this.root = this.#insertInto(this.root, value);
    this.root.red = false;
    return this.count > before;
  }

  delete(value: T): boolean {
    if (!this.has(value)) return false;
    const root = this.root!;
    if (!isRed(root.left) && !isRed(root.right)) root.red = true;
    this.root = this.#deleteFrom(root, value);
    if (this.root) this.root.red = false;
    this.count--;
    return true;
  }

  #insertInto(h: RBNode<T> | null, value: T): RBNode<T> {
    if (!h) {
      this.count++;
      return { value, left: null, right: null, red: true };
    }
    const cmp = this.compare(value, h.value);
    if (cmp < 0) h.left = this.#insertInto(h.left, value);
    else if (cmp > 0) h.right = this.#insertInto(h.right, value);
    return fixUp(h);
  }

  // Предполагает, что value точно есть в поддереве h.
  #deleteFrom(h: RBNode<T>, value: T): RBNode<T> | null {
    if (this.compare(value, h.value) < 0) {
      if (!isRed(h.left) && !isRed(h.left!.left)) h = moveRedLeft(h);
      h.left = this.#deleteFrom(h.left!, value);
    } else {
      if (isRed(h.left)) h = rotateRight(h);
      if (this.compare(value, h.value) === 0 && !h.right) return null;
      if (!isRed(h.right) && !isRed(h.right!.left)) h = moveRedRight(h);
      if (this.compare(value, h.value) === 0) {
        let min = h.right!;
        while (min.left) min = min.left;
        h.value = min.value;
        h.right = deleteMin(h.right!);
      } else {
        h.right = this.#deleteFrom(h.right!, value);
      }
    }
    return fixUp(h);
  }
}
