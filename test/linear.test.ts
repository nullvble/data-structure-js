import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CircularBuffer, Deque, DoublyLinkedList, LinkedList, Queue, Stack } from '../src/index.js';

describe('Stack', () => {
  it('работает по принципу LIFO', () => {
    const s = new Stack([1, 2]);
    s.push(3);
    assert.equal(s.peek(), 3);
    assert.equal(s.pop(), 3);
    assert.equal(s.pop(), 2);
    assert.equal(s.size, 1);
    assert.deepEqual([...s], [1]);
  });

  it('возвращает undefined на пустом стеке', () => {
    const s = new Stack<number>();
    assert.equal(s.pop(), undefined);
    assert.equal(s.peek(), undefined);
    assert.ok(s.isEmpty());
  });

  it('toArray возвращает элементы от вершины', () => {
    assert.deepEqual(new Stack([1, 2, 3]).toArray(), [3, 2, 1]);
  });
});

describe('Queue', () => {
  it('работает по принципу FIFO', () => {
    const q = new Queue([1, 2, 3]);
    assert.equal(q.dequeue(), 1);
    q.enqueue(4);
    assert.deepEqual(q.toArray(), [2, 3, 4]);
    assert.equal(q.peek(), 2);
  });

  it('корректно растёт при переполнении кольцевого буфера', () => {
    const q = new Queue<number>();
    for (let i = 0; i < 5; i++) q.enqueue(i);
    for (let i = 0; i < 3; i++) q.dequeue();
    for (let i = 5; i < 100; i++) q.enqueue(i);
    assert.equal(q.size, 97);
    const out: number[] = [];
    while (!q.isEmpty()) out.push(q.dequeue()!);
    assert.deepEqual(out, Array.from({ length: 97 }, (_, i) => i + 3));
    assert.equal(q.dequeue(), undefined);
  });
});

describe('Deque', () => {
  it('добавляет и извлекает с обоих концов', () => {
    const d = new Deque<number>();
    d.pushBack(2).pushBack(3).pushFront(1).pushFront(0);
    assert.deepEqual(d.toArray(), [0, 1, 2, 3]);
    assert.equal(d.peekFront(), 0);
    assert.equal(d.peekBack(), 3);
    assert.equal(d.at(-1), 3);
    assert.equal(d.at(1), 1);
    assert.equal(d.at(10), undefined);
    assert.equal(d.popFront(), 0);
    assert.equal(d.popBack(), 3);
    assert.deepEqual([...d], [1, 2]);
  });

  it('совпадает с массивом на случайной последовательности операций', () => {
    const d = new Deque<number>();
    const ref: number[] = [];
    for (let i = 0; i < 2000; i++) {
      const op = (i * 7919) % 4;
      if (op === 0) (d.pushFront(i), ref.unshift(i));
      else if (op === 1) (d.pushBack(i), ref.push(i));
      else if (op === 2) assert.equal(d.popFront(), ref.shift());
      else if (i % 3 === 0) assert.equal(d.popBack(), ref.pop());
    }
    assert.deepEqual(d.toArray(), ref);
  });
});

describe('CircularBuffer', () => {
  it('перезаписывает самые старые элементы', () => {
    const b = new CircularBuffer<number>(3);
    assert.equal(b.push(1), undefined);
    b.push(2);
    b.push(3);
    assert.ok(b.isFull());
    assert.equal(b.push(4), 1);
    assert.deepEqual(b.toArray(), [2, 3, 4]);
    assert.equal(b.peekFirst(), 2);
    assert.equal(b.peekLast(), 4);
    assert.equal(b.at(1), 3);
  });

  it('извлекает элементы с обоих концов', () => {
    const b = new CircularBuffer<string>(4);
    ['a', 'b', 'c', 'd', 'e'].forEach((x) => b.push(x));
    assert.equal(b.shift(), 'b');
    assert.equal(b.pop(), 'e');
    assert.deepEqual([...b], ['c', 'd']);
    assert.equal(b.capacity, 4);
    b.clear();
    assert.ok(b.isEmpty());
  });

  it('проверяет ёмкость', () => {
    assert.throws(() => new CircularBuffer(0), RangeError);
  });
});

describe('LinkedList', () => {
  it('поддерживает вставку, удаление и поиск', () => {
    const list = new LinkedList([1, 2, 4]);
    list.insertAt(2, 3).prepend(0);
    assert.deepEqual(list.toArray(), [0, 1, 2, 3, 4]);
    assert.equal(list.get(3), 3);
    assert.equal(list.indexOf(4), 4);
    assert.equal(list.removeAt(4), 4);
    assert.equal(list.tail, 3);
    assert.ok(list.remove(0));
    assert.equal(list.head, 1);
    assert.ok(!list.remove(42));
    assert.deepEqual(list.reverse().toArray(), [3, 2, 1]);
    assert.equal(list.tail, 1);
    list.append(0);
    assert.deepEqual(list.toArray(), [3, 2, 1, 0]);
  });

  it('бросает RangeError при неверном индексе вставки', () => {
    assert.throws(() => new LinkedList<string>().insertAt(1, 'x'), RangeError);
  });
});

describe('DoublyLinkedList', () => {
  it('удаляет узлы за O(1) и итерируется в обе стороны', () => {
    const list = new DoublyLinkedList([1, 2, 3]);
    const node = list.push(4);
    list.unshift(0);
    assert.deepEqual(list.toArray(), [0, 1, 2, 3, 4]);
    assert.equal(list.removeNode(node), 4);
    assert.deepEqual([...list.reversed()], [3, 2, 1, 0]);
    assert.equal(list.shift(), 0);
    assert.equal(list.pop(), 3);
    list.moveToFront(list.tailNode!);
    assert.deepEqual(list.toArray(), [2, 1]);
    assert.equal(list.size, 2);
  });
});
