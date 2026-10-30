import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BitSet, BloomFilter, DisjointSet, FenwickTree, LRUCache, MultiMap, SegmentTree } from '../src/index.js';

describe('SegmentTree', () => {
  const values = [5, 2, 8, 1, 9, 3, 7];

  it('отвечает на запросы суммы, минимума и максимума', () => {
    const sum = SegmentTree.sum(values);
    const min = SegmentTree.min(values);
    const max = SegmentTree.max(values);
    for (let l = 0; l <= values.length; l++) {
      for (let r = l; r <= values.length; r++) {
        const slice = values.slice(l, r);
        assert.equal(sum.query(l, r), slice.reduce((a, b) => a + b, 0));
        assert.equal(min.query(l, r), Math.min(...slice));
        assert.equal(max.query(l, r), Math.max(...slice));
      }
    }
  });

  it('обновляет элементы', () => {
    const tree = SegmentTree.min(values);
    tree.set(3, 100);
    assert.equal(tree.query(2, 5), 8);
    assert.equal(tree.get(3), 100);
    assert.equal(tree.query(), 2);
  });

  it('сохраняет порядок для некоммутативной операции', () => {
    const tree = new SegmentTree(['a', 'b', 'c', 'd', 'e'], (x, y) => x + y, '');
    assert.equal(tree.query(1, 4), 'bcd');
    tree.set(2, 'X');
    assert.equal(tree.query(), 'abXde');
  });

  it('проверяет границы', () => {
    const tree = SegmentTree.sum([1, 2]);
    assert.throws(() => tree.query(1, 3), RangeError);
    assert.throws(() => tree.set(2, 0), RangeError);
  });
});

describe('FenwickTree', () => {
  it('считает префиксные суммы и суммы на отрезках', () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6];
    const tree = new FenwickTree(values);
    for (let l = 0; l <= values.length; l++) {
      for (let r = l; r <= values.length; r++) {
        assert.equal(tree.rangeSum(l, r), values.slice(l, r).reduce((a, b) => a + b, 0));
      }
    }
  });

  it('обновляет элементы', () => {
    const tree = new FenwickTree(5);
    tree.add(0, 3);
    tree.add(2, 4);
    tree.set(2, 10);
    assert.deepEqual(tree.toArray(), [3, 0, 10, 0, 0]);
    assert.equal(tree.prefixSum(3), 13);
    assert.throws(() => tree.add(5, 1), RangeError);
  });
});

describe('BitSet', () => {
  it('устанавливает, сбрасывает и считает биты', () => {
    const bits = new BitSet(100);
    bits.set(0).set(31).set(32).set(99).toggle(5).toggle(5);
    assert.ok(bits.has(31) && bits.has(32) && !bits.has(5));
    assert.equal(bits.count(), 4);
    assert.deepEqual([...bits], [0, 31, 32, 99]);
    bits.unset(31);
    assert.deepEqual(bits.toArray(), [0, 32, 99]);
    assert.throws(() => bits.set(100), RangeError);
  });

  it('выполняет операции над множествами', () => {
    const a = BitSet.from([1, 2, 3, 40], 64);
    const b = BitSet.from([3, 4, 40], 64);
    assert.deepEqual(a.union(b).toArray(), [1, 2, 3, 4, 40]);
    assert.deepEqual(a.intersection(b).toArray(), [3, 40]);
    assert.deepEqual(a.difference(b).toArray(), [1, 2]);
    assert.ok(new BitSet(10).isEmpty());
    assert.throws(() => a.union(new BitSet(10)), RangeError);
  });
});

describe('BloomFilter', () => {
  it('не даёт ложноотрицательных ответов и держит заданную точность', () => {
    const n = 5000;
    const filter = new BloomFilter(n, 0.01);
    for (let i = 0; i < n; i++) filter.add(`item-${i}`);
    for (let i = 0; i < n; i++) assert.ok(filter.mightContain(`item-${i}`));
    let falsePositives = 0;
    for (let i = 0; i < n; i++) if (filter.mightContain(`other-${i}`)) falsePositives++;
    assert.ok(falsePositives / n < 0.03, `FP rate ${falsePositives / n}`);
    assert.ok(filter.estimatedFalsePositiveRate() < 0.02);
    assert.equal(filter.count, n);
    assert.equal(filter.hashCount, 7);
  });

  it('принимает числа и проверяет параметры', () => {
    const filter = new BloomFilter(10).add(42);
    assert.ok(filter.mightContain(42));
    assert.throws(() => new BloomFilter(10, 1), RangeError);
    assert.throws(() => new BloomFilter(0), RangeError);
  });
});

describe('DisjointSet', () => {
  it('объединяет множества и проверяет связность', () => {
    const ds = new DisjointSet([1, 2, 3, 4, 5]);
    assert.equal(ds.setCount, 5);
    assert.ok(ds.union(1, 2));
    assert.ok(ds.union(3, 4));
    assert.ok(ds.union(2, 4));
    assert.ok(!ds.union(1, 3));
    assert.ok(ds.connected(1, 4));
    assert.ok(!ds.connected(1, 5));
    assert.equal(ds.setCount, 2);
    const groups = ds.groups().map((g) => g.sort()).sort((a, b) => a.length - b.length);
    assert.deepEqual(groups, [[5], [1, 2, 3, 4]]);
  });
});

describe('MultiMap', () => {
  it('хранит несколько значений на ключ', () => {
    const m = new MultiMap<string, number>([['a', 1], ['b', 2], ['a', 3]]);
    assert.deepEqual(m.get('a'), [1, 3]);
    assert.deepEqual(m.get('z'), []);
    assert.equal(m.size, 3);
    assert.equal(m.keyCount, 2);
    assert.equal(m.count('a'), 2);
    assert.ok(m.hasEntry('a', 3));
    assert.deepEqual([...m], [['a', 1], ['a', 3], ['b', 2]]);
    assert.ok(m.deleteEntry('a', 1));
    assert.ok(m.deleteEntry('a', 3));
    assert.ok(!m.has('a'));
    assert.ok(m.delete('b'));
    assert.ok(m.isEmpty());
  });

  it('группирует элементы', () => {
    const m = MultiMap.groupBy(['apple', 'avocado', 'banana'], (s) => s[0]!);
    assert.deepEqual([...m.groups()], [['a', ['apple', 'avocado']], ['b', ['banana']]]);
    assert.deepEqual([...m.values()], ['apple', 'avocado', 'banana']);
  });
});

describe('LRUCache', () => {
  it('вытесняет давно неиспользуемый ключ', () => {
    const cache = new LRUCache<string, number>(2);
    cache.set('a', 1).set('b', 2);
    assert.equal(cache.get('a'), 1);
    cache.set('c', 3);
    assert.ok(!cache.has('b'));
    assert.deepEqual(cache.keys(), ['c', 'a']);
    cache.set('a', 10);
    cache.set('d', 4);
    assert.ok(!cache.has('c'));
    assert.deepEqual([...cache], [['d', 4], ['a', 10]]);
    assert.ok(cache.delete('a'));
    assert.equal(cache.size, 1);
  });

  it('peek не обновляет порядок', () => {
    const cache = new LRUCache<string, number>(2);
    cache.set('a', 1).set('b', 2);
    assert.equal(cache.peek('a'), 1);
    cache.set('c', 3);
    assert.ok(!cache.has('a'));
  });

  it('проверяет ёмкость', () => {
    assert.throws(() => new LRUCache(0), RangeError);
  });
});
