import { type Comparator, defaultCompare } from './comparator.js';

/** Минимальный узел двоичного дерева. */
export interface BinaryTreeNode<T> {
  value: T;
  left: this | null;
  right: this | null;
}

/**
 * Общая основа упорядоченных двоичных деревьев поиска ({@link BinarySearchTree},
 * {@link AVLTree}, {@link RedBlackTree}): поиск, `floor`/`ceil`, диапазоны и обходы.
 * Наследники реализуют только вставку и удаление.
 */
export abstract class BinaryTree<T, N extends BinaryTreeNode<T> = BinaryTreeNode<T>> implements Iterable<T> {
  protected root: N | null = null;
  protected count = 0;
  protected readonly compare: Comparator<T>;

  constructor(compare: Comparator<T> = defaultCompare) {
    this.compare = compare;
  }

  /** Вставляет значение. Дубликаты игнорируются. Возвращает `true`, если значение добавлено. */
  abstract insert(value: T): boolean;

  /** Удаляет значение. Возвращает `true`, если оно было в дереве. */
  abstract delete(value: T): boolean;

  /** Проверяет, есть ли значение в дереве. */
  has(value: T): boolean {
    return this.#find(value) !== null;
  }

  /**
   * Возвращает хранящийся в дереве элемент, равный `value` по компаратору.
   * Полезно, когда компаратор сравнивает только часть объекта (например, ключ).
   */
  get(value: T): T | undefined {
    return this.#find(value)?.value;
  }

  /** Наименьшее значение. */
  min(): T | undefined {
    let node = this.root;
    while (node?.left) node = node.left;
    return node?.value;
  }

  /** Наибольшее значение. */
  max(): T | undefined {
    let node = this.root;
    while (node?.right) node = node.right;
    return node?.value;
  }

  /** Наибольшее значение, не превышающее `value`. */
  floor(value: T): T | undefined {
    let result: T | undefined;
    let node = this.root;
    while (node) {
      const cmp = this.compare(value, node.value);
      if (cmp === 0) return node.value;
      if (cmp < 0) node = node.left;
      else {
        result = node.value;
        node = node.right;
      }
    }
    return result;
  }

  /** Наименьшее значение, не меньшее `value`. */
  ceil(value: T): T | undefined {
    let result: T | undefined;
    let node = this.root;
    while (node) {
      const cmp = this.compare(value, node.value);
      if (cmp === 0) return node.value;
      if (cmp > 0) node = node.right;
      else {
        result = node.value;
        node = node.left;
      }
    }
    return result;
  }

  /** Значения из отрезка `[low, high]` в порядке возрастания. Посещает только нужные поддеревья. */
  *range(low: T, high: T): IterableIterator<T> {
    yield* this.#range(this.root, low, high);
  }

  /** Высота дерева (пустое дерево — 0). */
  height(): number {
    const h = (node: N | null): number => (node ? 1 + Math.max(h(node.left), h(node.right)) : 0);
    return h(this.root);
  }

  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    this.root = null;
    this.count = 0;
  }

  /** Симметричный обход (в отсортированном порядке). */
  *inOrder(): IterableIterator<T> {
    const stack: N[] = [];
    let node = this.root;
    while (node || stack.length) {
      while (node) {
        stack.push(node);
        node = node.left;
      }
      node = stack.pop()!;
      yield node.value;
      node = node.right;
    }
  }

  /** Прямой обход: корень, левое поддерево, правое поддерево. */
  *preOrder(): IterableIterator<T> {
    const stack: N[] = this.root ? [this.root] : [];
    while (stack.length) {
      const node = stack.pop()!;
      yield node.value;
      if (node.right) stack.push(node.right);
      if (node.left) stack.push(node.left);
    }
  }

  /** Обратный обход: левое поддерево, правое поддерево, корень. */
  *postOrder(): IterableIterator<T> {
    const out: T[] = [];
    const stack: N[] = this.root ? [this.root] : [];
    while (stack.length) {
      const node = stack.pop()!;
      out.push(node.value);
      if (node.left) stack.push(node.left);
      if (node.right) stack.push(node.right);
    }
    for (let i = out.length - 1; i >= 0; i--) yield out[i] as T;
  }

  /** Обход в ширину (по уровням). */
  *levelOrder(): IterableIterator<T> {
    if (!this.root) return;
    const queue: N[] = [this.root];
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i]!;
      yield node.value;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  /** Все значения в отсортированном порядке. */
  toArray(): T[] {
    return [...this.inOrder()];
  }

  /** Итерация в отсортированном порядке. */
  [Symbol.iterator](): IterableIterator<T> {
    return this.inOrder();
  }

  #find(value: T): N | null {
    let node = this.root;
    while (node) {
      const cmp = this.compare(value, node.value);
      if (cmp === 0) return node;
      node = cmp < 0 ? node.left : node.right;
    }
    return null;
  }

  *#range(node: N | null, low: T, high: T): IterableIterator<T> {
    if (!node) return;
    const cmpLow = this.compare(low, node.value);
    const cmpHigh = this.compare(high, node.value);
    if (cmpLow < 0) yield* this.#range(node.left, low, high);
    if (cmpLow <= 0 && cmpHigh >= 0) yield node.value;
    if (cmpHigh > 0) yield* this.#range(node.right, low, high);
  }
}
