import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Graph } from '../src/index.js';

describe('Graph', () => {
  const build = () =>
    new Graph<string>()
      .addEdge('A', 'B', 4)
      .addEdge('A', 'C', 2)
      .addEdge('C', 'B', 1)
      .addEdge('B', 'D', 5)
      .addEdge('C', 'D', 8);

  it('обходит граф в ширину и глубину', () => {
    const g = build();
    assert.deepEqual(g.bfs('A'), ['A', 'B', 'C', 'D']);
    assert.deepEqual(g.dfs('A'), ['A', 'B', 'C', 'D']);
    assert.deepEqual(g.bfs('nope'), []);
    assert.equal(g.vertexCount, 4);
    assert.equal(g.edgeCount, 5);
  });

  it('находит кратчайший путь (Дейкстра)', () => {
    const g = build();
    assert.deepEqual(g.shortestPath('A', 'D'), { distance: 8, path: ['A', 'C', 'B', 'D'] });
    assert.deepEqual(g.shortestPath('A', 'A'), { distance: 0, path: ['A'] });
    g.addVertex('Z');
    assert.equal(g.shortestPath('A', 'Z'), null);
    g.addEdge('Z', 'A', -1);
    assert.throws(() => g.shortestPath('Z', 'D'), RangeError);
  });

  it('удаляет рёбра и вершины', () => {
    const g = build();
    assert.ok(g.removeEdge('A', 'B'));
    assert.ok(!g.hasEdge('B', 'A'));
    assert.ok(g.removeVertex('C'));
    assert.deepEqual(g.neighbors('A'), []);
    assert.equal(g.getWeight('B', 'D'), 5);
  });

  it('строит минимальное остовное дерево', () => {
    const mst = build().minimumSpanningTree();
    assert.equal(mst.weight, 8);
    assert.equal(mst.edges.length, 3);
  });

  it('находит компоненты связности', () => {
    const g = new Graph<number>().addEdge(1, 2).addEdge(3, 4).addVertex(5);
    const components = g.connectedComponents().map((c) => c.sort());
    assert.deepEqual(components, [[1, 2], [3, 4], [5]]);
  });

  it('выполняет топологическую сортировку и находит циклы', () => {
    const g = new Graph<string>({ directed: true })
      .addEdge('shirt', 'tie')
      .addEdge('tie', 'jacket')
      .addEdge('pants', 'shoes')
      .addEdge('pants', 'jacket');
    const order = g.topologicalSort();
    assert.ok(order.indexOf('shirt') < order.indexOf('tie'));
    assert.ok(order.indexOf('tie') < order.indexOf('jacket'));
    assert.ok(order.indexOf('pants') < order.indexOf('shoes'));
    assert.ok(!g.hasCycle());
    assert.equal(g.edgeCount, 4);
    g.addEdge('jacket', 'shirt');
    assert.ok(g.hasCycle());
    assert.throws(() => g.topologicalSort(), /cycle/);
    assert.throws(() => g.minimumSpanningTree());
  });

  it('находит циклы в неориентированном графе', () => {
    const tree = new Graph<number>().addEdge(1, 2).addEdge(1, 3).addEdge(3, 4);
    assert.ok(!tree.hasCycle());
    tree.addEdge(4, 2);
    assert.ok(tree.hasCycle());
  });
});
