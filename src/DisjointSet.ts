/**
 * Система непересекающихся множеств (Union-Find) со сжатием путей и объединением по рангу.
 * `find`/`union` — почти O(1) (обратная функция Аккермана).
 * Применяется для поиска компонент связности, алгоритма Краскала и т. п.
 *
 * @example
 * ```ts
 * const ds = new DisjointSet(['a', 'b', 'c']);
 * ds.union('a', 'b');
 * ds.connected('a', 'b'); // true
 * ds.setCount; // 2
 * ```
 */
export class DisjointSet<T> {
  #parent = new Map<T, T>();
  #rank = new Map<T, number>();
  #sets = 0;

  constructor(iterable: Iterable<T> = []) {
    for (const value of iterable) this.add(value);
  }

  /** Добавляет элемент как отдельное множество. Возвращает `false`, если он уже есть. */
  add(value: T): boolean {
    if (this.#parent.has(value)) return false;
    this.#parent.set(value, value);
    this.#rank.set(value, 0);
    this.#sets++;
    return true;
  }

  has(value: T): boolean {
    return this.#parent.has(value);
  }

  /** Представитель множества, содержащего `value`; `undefined`, если элемента нет. */
  find(value: T): T | undefined {
    if (!this.#parent.has(value)) return undefined;
    let root = value;
    while (this.#parent.get(root) !== root) root = this.#parent.get(root)!;
    while (value !== root) {
      const next = this.#parent.get(value)!;
      this.#parent.set(value, root);
      value = next;
    }
    return root;
  }

  /**
   * Объединяет множества, содержащие `a` и `b`. Отсутствующие элементы добавляются автоматически.
   * Возвращает `false`, если они уже были в одном множестве.
   */
  union(a: T, b: T): boolean {
    this.add(a);
    this.add(b);
    let rootA = this.find(a)!;
    let rootB = this.find(b)!;
    if (rootA === rootB) return false;
    if (this.#rank.get(rootA)! < this.#rank.get(rootB)!) [rootA, rootB] = [rootB, rootA];
    this.#parent.set(rootB, rootA);
    if (this.#rank.get(rootA) === this.#rank.get(rootB)) {
      this.#rank.set(rootA, this.#rank.get(rootA)! + 1);
    }
    this.#sets--;
    return true;
  }

  /** Находятся ли `a` и `b` в одном множестве. */
  connected(a: T, b: T): boolean {
    return this.has(a) && this.has(b) && this.find(a) === this.find(b);
  }

  /** Количество элементов. */
  get size(): number {
    return this.#parent.size;
  }

  /** Количество непересекающихся множеств. */
  get setCount(): number {
    return this.#sets;
  }

  /** Все множества; каждое — массив элементов. */
  groups(): T[][] {
    const groups = new Map<T, T[]>();
    for (const value of this.#parent.keys()) {
      const root = this.find(value)!;
      let group = groups.get(root);
      if (!group) groups.set(root, (group = []));
      group.push(value);
    }
    return [...groups.values()];
  }
}
