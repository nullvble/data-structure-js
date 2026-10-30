import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BinarySearchTree, AVLTree, MinHeap, MaxHeap, BinaryHeap, PriorityQueue, Trie } from '../src/index.js';

describe('BinarySearchTree', () => {
  const build = () => new BinarySearchTree([8, 3, 10, 1, 6, 14, 4, 7, 13]);

  it('хранит элементы в отсортированном порядке', () => {
    const t = build();
    assert.deepEqual([...t], [1, 3, 4, 6, 7, 8, 10, 13, 14]);
    assert.equal(t.size, 9);
    assert.equal(t.min(), 1);
    assert.equal(t.max(), 14);
    assert.ok(!t.insert(6), 'дубликат не вставляется');
  });

  it('поддерживает все виды обхода', () => {
    const t = build();
    assert.deepEqual([...t.preOrder()], [8, 3, 1, 6, 4, 7, 10, 14, 13]);
    assert.deepEqual([...t.postOrder()], [1, 4, 7, 6, 3, 13, 14, 10, 8]);
    assert.deepEqual([...t.levelOrder()], [8, 3, 10, 1, 6, 14, 4, 7, 13]);
  });

  it('удаляет листья, узлы с одним и двумя потомками', () => {
    const t = build();
    assert.ok(t.delete(4));
    assert.ok(t.delete(14));
    assert.ok(t.delete(3));
    assert.ok(t.delete(8));
    assert.ok(!t.delete(100));
    assert.deepEqual(t.toArray(), [1, 6, 7, 10, 13]);
    assert.equal(t.size, 5);
    assert.ok(!t.has(8));
  });

  it('находит floor и ceil', () => {
    const t = build();
    assert.equal(t.floor(5), 4);
    assert.equal(t.ceil(5), 6);
    assert.equal(t.floor(0), undefined);
    assert.equal(t.ceil(15), undefined);
  });

  it('принимает собственный компаратор', () => {
    const t = new BinarySearchTree([{ id: 2 }, { id: 1 }], (a, b) => a.id - b.id);
    assert.deepEqual(t.toArray().map((x) => x.id), [1, 2]);
    assert.ok(t.has({ id: 2 }));
  });
});

describe('AVLTree', () => {
  it('остаётся сбалансированным при отсортированной вставке', () => {
    const n = 1023;
    const t = new AVLTree(Array.from({ length: n }, (_, i) => i));
    assert.equal(t.size, n);
    assert.ok(t.height() <= Math.ceil(1.45 * Math.log2(n + 2)));
    assert.deepEqual(t.toArray(), Array.from({ length: n }, (_, i) => i));
  });

  it('корректно удаляет и сохраняет баланс', () => {
    const t = new AVLTree(Array.from({ length: 100 }, (_, i) => i));
    for (let i = 0; i < 100; i += 2) assert.ok(t.delete(i));
    assert.equal(t.size, 50);
    assert.ok(!t.has(10) && t.has(11));
    assert.equal(t.min(), 1);
    assert.equal(t.max(), 99);
    assert.ok(t.height() <= 9);
  });
});

describe('BinaryHeap', () => {
  it('MinHeap извлекает элементы по возрастанию', () => {
    const h = new MinHeap([5, 3, 8, 1, 9, 2]);
    h.push(0);
    const out = [];
    while (!h.isEmpty()) out.push(h.pop());
    assert.deepEqual(out, [0, 1, 2, 3, 5, 8, 9]);
  });

  it('MaxHeap извлекает элементы по убыванию', () => {
    const h = new MaxHeap([5, 3, 8, 1]);
    assert.equal(h.peek(), 8);
    assert.deepEqual([h.pop(), h.pop(), h.pop(), h.pop(), h.pop()], [8, 5, 3, 1, undefined]);
  });

  it('сортирует случайные данные как Array#sort', () => {
    const data = Array.from({ length: 500 }, () => Math.floor(Math.random() * 1000));
    const h = new BinaryHeap(data, (a, b) => a - b);
    const out = [];
    while (h.size) out.push(h.pop());
    assert.deepEqual(out, [...data].sort((a, b) => a - b));
  });
});

describe('PriorityQueue', () => {
  it('извлекает по приоритету и стабилен при равных', () => {
    const pq = new PriorityQueue();
    pq.enqueue('low', 5).enqueue('high-a', 1).enqueue('mid', 3).enqueue('high-b', 1);
    assert.equal(pq.peekPriority(), 1);
    assert.deepEqual(
      [pq.dequeue(), pq.dequeue(), pq.dequeue(), pq.dequeue(), pq.dequeue()],
      ['high-a', 'high-b', 'mid', 'low', undefined],
    );
  });
});

describe('Trie', () => {
  it('ищет слова и префиксы', () => {
    const t = new Trie(['car', 'cart', 'care', 'dog']);
    assert.ok(t.has('car'));
    assert.ok(!t.has('ca'));
    assert.ok(t.hasPrefix('ca'));
    assert.ok(!t.hasPrefix('x'));
    assert.deepEqual(t.wordsWithPrefix('car'), ['car', 'care', 'cart']);
    assert.equal(t.size, 4);
    assert.ok(!t.insert('dog'));
  });

  it('удаляет слова, не затрагивая соседние', () => {
    const t = new Trie(['car', 'cart', 'кот']);
    assert.ok(t.delete('car'));
    assert.ok(!t.has('car'));
    assert.ok(t.has('cart'));
    assert.ok(t.delete('cart'));
    assert.ok(!t.hasPrefix('c'));
    assert.ok(!t.delete('nope'));
    assert.deepEqual(t.toArray(), ['кот']);
  });
});
