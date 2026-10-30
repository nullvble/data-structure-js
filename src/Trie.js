class Node {
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}

/**
 * Префиксное дерево для строк. Операции — O(L), где L — длина слова.
 */
export class Trie {
  #root = new Node();
  #size = 0;

  constructor(words = []) {
    for (const word of words) this.insert(word);
  }

  insert(word) {
    let node = this.#root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new Node());
      node = node.children.get(ch);
    }
    if (node.isWord) return false;
    node.isWord = true;
    this.#size++;
    return true;
  }

  has(word) {
    return this.#find(word)?.isWord ?? false;
  }

  hasPrefix(prefix) {
    return this.#find(prefix) !== null;
  }

  delete(word) {
    const path = [this.#root];
    const chars = [...word];
    for (const ch of chars) {
      const next = path[path.length - 1].children.get(ch);
      if (!next) return false;
      path.push(next);
    }
    const last = path[path.length - 1];
    if (!last.isWord) return false;
    last.isWord = false;
    this.#size--;
    // Удаляем ставшие ненужными узлы снизу вверх.
    for (let i = chars.length; i > 0; i--) {
      const node = path[i];
      if (node.isWord || node.children.size > 0) break;
      path[i - 1].children.delete(chars[i - 1]);
    }
    return true;
  }

  /** Все слова с данным префиксом в лексикографическом порядке. */
  wordsWithPrefix(prefix = '') {
    const start = this.#find(prefix);
    if (!start) return [];
    const result = [];
    const walk = (node, acc) => {
      if (node.isWord) result.push(acc);
      const keys = [...node.children.keys()].sort();
      for (const ch of keys) walk(node.children.get(ch), acc + ch);
    };
    walk(start, prefix);
    return result;
  }

  get size() {
    return this.#size;
  }

  isEmpty() {
    return this.#size === 0;
  }

  clear() {
    this.#root = new Node();
    this.#size = 0;
  }

  toArray() {
    return this.wordsWithPrefix('');
  }

  [Symbol.iterator]() {
    return this.toArray()[Symbol.iterator]();
  }

  #find(str) {
    let node = this.#root;
    for (const ch of str) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }
}
