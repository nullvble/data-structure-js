interface TrieNode {
  children: Map<string, TrieNode>;
  isWord: boolean;
}

const createNode = (): TrieNode => ({ children: new Map(), isWord: false });

/**
 * Префиксное дерево (trie) для строк. Операции — O(L), где L — длина слова,
 * независимо от количества слов. Поддерживает Unicode (итерация по code points).
 *
 * @example
 * ```ts
 * const trie = new Trie(['car', 'cart', 'care', 'dog']);
 * trie.wordsWithPrefix('car'); // ['car', 'care', 'cart']
 * trie.hasPrefix('do'); // true
 * ```
 */
export class Trie implements Iterable<string> {
  #root = createNode();
  #size = 0;

  constructor(words: Iterable<string> = []) {
    for (const word of words) this.insert(word);
  }

  /** Добавляет слово. Возвращает `false`, если оно уже было. */
  insert(word: string): boolean {
    let node = this.#root;
    for (const ch of word) {
      let next = node.children.get(ch);
      if (!next) {
        next = createNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    if (node.isWord) return false;
    node.isWord = true;
    this.#size++;
    return true;
  }

  has(word: string): boolean {
    return this.#find(word)?.isWord ?? false;
  }

  /** Есть ли хотя бы одно слово, начинающееся с `prefix`. */
  hasPrefix(prefix: string): boolean {
    return this.#find(prefix) !== null;
  }

  /** Удаляет слово и ставшие ненужными узлы. */
  delete(word: string): boolean {
    const path = [this.#root];
    const chars = [...word];
    for (const ch of chars) {
      const next = path[path.length - 1]!.children.get(ch);
      if (!next) return false;
      path.push(next);
    }
    const last = path[path.length - 1]!;
    if (!last.isWord) return false;
    last.isWord = false;
    this.#size--;
    for (let i = chars.length; i > 0; i--) {
      const node = path[i]!;
      if (node.isWord || node.children.size > 0) break;
      path[i - 1]!.children.delete(chars[i - 1]!);
    }
    return true;
  }

  /** Все слова с данным префиксом в лексикографическом порядке. */
  wordsWithPrefix(prefix = ''): string[] {
    const start = this.#find(prefix);
    if (!start) return [];
    const result: string[] = [];
    const walk = (node: TrieNode, acc: string): void => {
      if (node.isWord) result.push(acc);
      for (const ch of [...node.children.keys()].sort()) walk(node.children.get(ch)!, acc + ch);
    };
    walk(start, prefix);
    return result;
  }

  /** Самый длинный общий префикс всех слов. */
  longestCommonPrefix(): string {
    if (this.#size === 0) return '';
    let prefix = '';
    let node = this.#root;
    while (!node.isWord && node.children.size === 1) {
      const [ch, next] = node.children.entries().next().value!;
      prefix += ch;
      node = next;
    }
    return prefix;
  }

  get size(): number {
    return this.#size;
  }

  isEmpty(): boolean {
    return this.#size === 0;
  }

  clear(): void {
    this.#root = createNode();
    this.#size = 0;
  }

  toArray(): string[] {
    return this.wordsWithPrefix('');
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this.toArray()[Symbol.iterator]();
  }

  #find(str: string): TrieNode | null {
    let node: TrieNode | undefined = this.#root;
    for (const ch of str) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }
}
