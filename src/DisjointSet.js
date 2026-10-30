/**
 * Система непересекающихся множеств (Union-Find) со сжатием путей
 * и объединением по рангу. find/union — почти O(1) (обратная функция Аккермана).
 */
export class DisjointSet {
  #parent = new Map();
  #rank = new Map();
  #sets = 0;

  constructor(iterable = []) {
    for (const value of iterable) this.add(value);
  }

  add(value) {
    if (this.#parent.has(value)) return false;
    this.#parent.set(value, value);
    this.#rank.set(value, 0);
    this.#sets++;
    return true;
  }

  has(value) {
    return this.#parent.has(value);
  }

  /** Представитель множества, содержащего value (undefined, если элемента нет). */
  find(value) {
    if (!this.#parent.has(value)) return undefined;
    let root = value;
    while (this.#parent.get(root) !== root) root = this.#parent.get(root);
    while (value !== root) {
      const next = this.#parent.get(value);
      this.#parent.set(value, root);
      value = next;
    }
    return root;
  }

  /** Объединяет множества. Отсутствующие элементы добавляются автоматически. */
  union(a, b) {
    this.add(a);
    this.add(b);
    let rootA = this.find(a);
    let rootB = this.find(b);
    if (rootA === rootB) return false;
    if (this.#rank.get(rootA) < this.#rank.get(rootB)) [rootA, rootB] = [rootB, rootA];
    this.#parent.set(rootB, rootA);
    if (this.#rank.get(rootA) === this.#rank.get(rootB)) {
      this.#rank.set(rootA, this.#rank.get(rootA) + 1);
    }
    this.#sets--;
    return true;
  }

  connected(a, b) {
    return this.has(a) && this.has(b) && this.find(a) === this.find(b);
  }

  /** Количество элементов. */
  get size() {
    return this.#parent.size;
  }

  /** Количество непересекающихся множеств. */
  get setCount() {
    return this.#sets;
  }

  /** Массив групп (каждая группа — массив элементов). */
  groups() {
    const groups = new Map();
    for (const value of this.#parent.keys()) {
      const root = this.find(value);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(value);
    }
    return [...groups.values()];
  }
}
