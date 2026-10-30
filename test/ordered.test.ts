import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AVLTree, BinarySearchTree, RedBlackTree, SkipList, SortedMap } from '../src/index.js';

// Детерминированный ГПСЧ (mulberry32), чтобы тесты были воспроизводимы.
function rng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface OrderedSet<T> extends Iterable<T> {
  insert(value: T): boolean;
  delete(value: T): boolean;
  has(value: T): boolean;
  min(): T | undefined;
  max(): T | undefined;
  range(low: T, high: T): Iterable<T>;
  readonly size: number;
}

const implementations: [string, () => OrderedSet<number>][] = [
  ['BinarySearchTree', () => new BinarySearchTree<number>()],
  ['AVLTree', () => new AVLTree<number>()],
  ['RedBlackTree', () => new RedBlackTree<number>()],
  ['SkipList', () => new SkipList<number>([], undefined, rng(7))],
];

for (const [name, create] of implementations) {
  describe(`${name}: общий контракт упорядоченного множества`, () => {
    it('совпадает с эталоном на случайных вставках и удалениях', () => {
      const random = rng(42);
      const set = create();
      const ref = new Set<number>();
      for (let i = 0; i < 3000; i++) {
        const value = Math.floor(random() * 500);
        if (random() < 0.6) assert.equal(set.insert(value), !ref.has(value) && !!ref.add(value));
        else assert.equal(set.delete(value), ref.delete(value));
      }
      const sorted = [...ref].sort((a, b) => a - b);
      assert.deepEqual([...set], sorted);
      assert.equal(set.size, ref.size);
      assert.equal(set.min(), sorted[0]);
      assert.equal(set.max(), sorted.at(-1));
      assert.deepEqual([...set.range(100, 200)], sorted.filter((x) => x >= 100 && x <= 200));
      for (let v = 0; v < 500; v += 37) assert.equal(set.has(v), ref.has(v));
    });

    it('корректно работает в пустом состоянии', () => {
      const set = create();
      assert.equal(set.min(), undefined);
      assert.equal(set.max(), undefined);
      assert.ok(!set.delete(1));
      assert.deepEqual([...set.range(0, 10)], []);
    });
  });
}

describe('BinarySearchTree', () => {
  const build = () => new BinarySearchTree([8, 3, 10, 1, 6, 14, 4, 7, 13]);

  it('поддерживает все виды обхода', () => {
    const t = build();
    assert.deepEqual([...t.inOrder()], [1, 3, 4, 6, 7, 8, 10, 13, 14]);
    assert.deepEqual([...t.preOrder()], [8, 3, 1, 6, 4, 7, 10, 14, 13]);
    assert.deepEqual([...t.postOrder()], [1, 4, 7, 6, 3, 13, 14, 10, 8]);
    assert.deepEqual([...t.levelOrder()], [8, 3, 10, 1, 6, 14, 4, 7, 13]);
    assert.equal(t.height(), 4);
  });

  it('находит floor и ceil', () => {
    const t = build();
    assert.equal(t.floor(5), 4);
    assert.equal(t.ceil(5), 6);
    assert.equal(t.floor(6), 6);
    assert.equal(t.floor(0), undefined);
    assert.equal(t.ceil(15), undefined);
  });

  it('принимает собственный компаратор и get возвращает хранимый объект', () => {
    const t = new BinarySearchTree([{ id: 2, name: 'b' }, { id: 1, name: 'a' }], (a, b) => a.id - b.id);
    assert.deepEqual(t.toArray().map((x) => x.id), [1, 2]);
    assert.equal(t.get({ id: 2, name: '' })?.name, 'b');
  });

  it('вырождается в список на отсортированных данных', () => {
    const t = new BinarySearchTree(Array.from({ length: 100 }, (_, i) => i));
    assert.equal(t.height(), 100);
  });
});

describe('AVLTree', () => {
  it('остаётся сбалансированным при отсортированной вставке', () => {
    const n = 1023;
    const t = new AVLTree(Array.from({ length: n }, (_, i) => i));
    assert.equal(t.size, n);
    assert.ok(t.height() <= Math.ceil(1.45 * Math.log2(n + 2)));
  });
});

describe('RedBlackTree', () => {
  // Проверяет инварианты LLRB: корень чёрный, нет двух красных подряд,
  // красные ссылки только левые, одинаковая чёрная высота всех путей.
  class CheckedTree extends RedBlackTree<number> {
    blackHeight(): number {
      type Node = { red: boolean; left: Node | null; right: Node | null };
      const walk = (node: Node | null, parentRed: boolean): number => {
        if (!node) return 1;
        assert.ok(!(node.red && parentRed), 'два красных узла подряд');
        assert.ok(!node.right?.red, 'красная правая ссылка');
        const left = walk(node.left, node.red);
        assert.equal(left, walk(node.right, node.red), 'разная чёрная высота');
        return left + (node.red ? 0 : 1);
      };
      const root = this.root as unknown as Node | null;
      assert.ok(!root?.red, 'красный корень');
      return walk(root, false);
    }
  }

  it('сохраняет инварианты при вставках и удалениях', () => {
    const random = rng(1);
    const t = new CheckedTree();
    for (let i = 0; i < 2000; i++) {
      const value = Math.floor(random() * 300);
      if (random() < 0.55) t.insert(value);
      else t.delete(value);
      if (i % 50 === 0) t.blackHeight();
    }
    t.blackHeight();
    assert.ok(t.height() <= 2 * Math.log2(t.size + 1));
  });
});

describe('SortedMap', () => {
  it('хранит ключи упорядоченными', () => {
    const m = new SortedMap<number, string>([[300, 'c'], [100, 'a'], [200, 'b']]);
    assert.deepEqual([...m.keys()], [100, 200, 300]);
    assert.deepEqual([...m.values()], ['a', 'b', 'c']);
    assert.equal(m.firstKey(), 100);
    assert.equal(m.lastKey(), 300);
    assert.equal(m.floorKey(250), 200);
    assert.equal(m.ceilKey(250), 300);
    assert.deepEqual([...m.entriesBetween(150, 300)], [[200, 'b'], [300, 'c']]);
  });

  it('обновляет и удаляет значения', () => {
    const m = new SortedMap<string, number>();
    m.set('b', 1).set('a', 2).set('b', 3);
    assert.equal(m.size, 2);
    assert.equal(m.get('b'), 3);
    assert.ok(m.delete('a'));
    assert.ok(!m.has('a'));
    assert.deepEqual([...m], [['b', 3]]);
  });

  it('поддерживает собственный компаратор', () => {
    const m = new SortedMap<string, number>([['b', 1], ['a', 2]], (x, y) => y.localeCompare(x));
    assert.deepEqual([...m.keys()], ['b', 'a']);
  });
});
