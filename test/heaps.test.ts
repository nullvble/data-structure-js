import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BinaryHeap, MaxHeap, MinHeap, PriorityQueue, Trie } from '../src/index.js';

describe('BinaryHeap', () => {
  it('MinHeap извлекает элементы по возрастанию', () => {
    const h = new MinHeap([5, 3, 8, 1, 9, 2]);
    h.push(0);
    const out: number[] = [];
    while (!h.isEmpty()) out.push(h.pop()!);
    assert.deepEqual(out, [0, 1, 2, 3, 5, 8, 9]);
  });

  it('MaxHeap извлекает элементы по убыванию', () => {
    const h = new MaxHeap([5, 3, 8, 1]);
    assert.equal(h.peek(), 8);
    assert.deepEqual([h.pop(), h.pop(), h.pop(), h.pop(), h.pop()], [8, 5, 3, 1, undefined]);
  });

  it('сортирует данные как Array#sort', () => {
    const data = Array.from({ length: 500 }, (_, i) => (i * 7919) % 1000);
    const h = new BinaryHeap(data, (a, b) => a - b);
    assert.deepEqual(h.toSortedArray(), [...data].sort((a, b) => a - b));
    const out: number[] = [];
    while (h.size) out.push(h.pop()!);
    assert.deepEqual(out, [...data].sort((a, b) => a - b));
  });

  it('pushPop', () => {
    const h = new MinHeap([3, 5]);
    assert.equal(h.pushPop(1), 1);
    assert.equal(h.pushPop(4), 3);
    assert.deepEqual(h.toSortedArray(), [4, 5]);
  });
});

describe('PriorityQueue', () => {
  it('извлекает по приоритету и стабилен при равных', () => {
    const pq = new PriorityQueue<string>();
    pq.enqueue('low', 5).enqueue('high-a', 1).enqueue('mid', 3).enqueue('high-b', 1);
    assert.equal(pq.peekPriority(), 1);
    assert.equal(pq.peek(), 'high-a');
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

  it('находит общий префикс', () => {
    assert.equal(new Trie(['flower', 'flow', 'flight']).longestCommonPrefix(), 'fl');
    assert.equal(new Trie(['flow', 'flower']).longestCommonPrefix(), 'flow');
    assert.equal(new Trie().longestCommonPrefix(), '');
  });
});
