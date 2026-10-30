import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DisjointSet, LRUCache, Graph } from '../src/index.js';

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
    assert.deepEqual(ds.groups().map((g) => g.sort()).sort((a, b) => a.length - b.length), [[5], [1, 2, 3, 4]]);
  });
});

describe('LRUCache', () => {
  it('вытесняет давно неиспользуемый ключ', () => {
    const cache = new LRUCache(2);
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
    const cache = new LRUCache(2);
    cache.set('a', 1).set('b', 2);
    assert.equal(cache.peek('a'), 1);
    cache.set('c', 3);
    assert.ok(!cache.has('a'));
  });

  it('проверяет ёмкость', () => {
    assert.throws(() => new LRUCache(0), RangeError);
  });
});

describe('Graph', () => {
  const build = () =>
    new Graph()
      .addEdge('A', 'B', 4)
      .addEdge('A', 'C', 2)
      .addEdge('C', 'B', 1)
      .addEdge('B', 'D', 5)
      .addEdge('C', 'D', 8);

  it('обходит граф в ширину и глубину', () => {
    const g = build();
    assert.deepEqual(g.bfs('A'), ['A', 'B', 'C', 'D']);
    assert.deepEqual(g.dfs('A'), ['A', 'B', 'C', 'D']);
    assert.equal(g.vertexCount, 4);
    assert.equal(g.edgeCount, 5);
  });

  it('находит кратчайший путь (Дейкстра)', () => {
    const g = build();
    assert.deepEqual(g.shortestPath('A', 'D'), { distance: 8, path: ['A', 'C', 'B', 'D'] });
    g.addVertex('Z');
    assert.equal(g.shortestPath('A', 'Z'), null);
  });

  it('удаляет рёбра и вершины', () => {
    const g = build();
    assert.ok(g.removeEdge('A', 'B'));
    assert.ok(!g.hasEdge('B', 'A'));
    assert.ok(g.removeVertex('C'));
    assert.deepEqual(g.neighbors('A'), []);
  });

  it('выполняет топологическую сортировку и находит циклы', () => {
    const g = new Graph({ directed: true })
      .addEdge('shirt', 'tie')
      .addEdge('tie', 'jacket')
      .addEdge('pants', 'shoes')
      .addEdge('pants', 'jacket');
    const order = g.topologicalSort();
    assert.ok(order.indexOf('shirt') < order.indexOf('tie'));
    assert.ok(order.indexOf('tie') < order.indexOf('jacket'));
    assert.ok(order.indexOf('pants') < order.indexOf('shoes'));
    assert.ok(!g.hasCycle());
    g.addEdge('jacket', 'shirt');
    assert.ok(g.hasCycle());
    assert.throws(() => g.topologicalSort(), /cycle/);
  });

  it('находит циклы в неориентированном графе', () => {
    const tree = new Graph().addEdge(1, 2).addEdge(1, 3).addEdge(3, 4);
    assert.ok(!tree.hasCycle());
    tree.addEdge(4, 2);
    assert.ok(tree.hasCycle());
  });
});
