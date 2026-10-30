---
title: Линейные структуры
group: Структуры
---

# Линейные структуры

## Stack — стек

LIFO: последний добавленный элемент извлекается первым.

```ts
import { Stack } from 'ds-kit-js';

function isBalanced(s: string): boolean {
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack = new Stack<string>();
  for (const ch of s) {
    if ('([{'.includes(ch)) stack.push(ch);
    else if (ch in pairs && stack.pop() !== pairs[ch]) return false;
  }
  return stack.isEmpty();
}

isBalanced('{[()]}'); // true
```

Итерация и `toArray()` идут **от вершины к основанию**.

## Queue — очередь

FIFO: первый добавленный элемент извлекается первым. Встроенный `Array#shift`
работает за O(n), потому что сдвигает весь массив. `Queue` построена на кольцевом
буфере, поэтому `dequeue` выполняется за O(1).

```ts
import { Queue } from 'ds-kit-js';

const jobs = new Queue<string>(['resize', 'upload']);
jobs.enqueue('notify');
jobs.dequeue(); // 'resize'
jobs.peek();    // 'upload'
```

## Deque — двусторонняя очередь

Вставка и удаление с обоих концов за O(1) плюс доступ по индексу через `at()`
(поддерживает отрицательные индексы, как `Array#at`).

```ts
import { Deque } from 'ds-kit-js';

// Максимум в скользящем окне размера k за O(n)
function slidingMax(nums: number[], k: number): number[] {
  const window = new Deque<number>(); // индексы, значения по убыванию
  const result: number[] = [];
  nums.forEach((n, i) => {
    while (!window.isEmpty() && nums[window.peekBack()!]! <= n) window.popBack();
    window.pushBack(i);
    if (window.peekFront()! <= i - k) window.popFront();
    if (i >= k - 1) result.push(nums[window.peekFront()!]!);
  });
  return result;
}

slidingMax([1, 3, -1, -3, 5, 3, 6, 7], 3); // [3, 3, 5, 5, 6, 7]
```

## CircularBuffer — кольцевой буфер

Ёмкость фиксирована. Когда буфер заполнен, `push` вытесняет самый старый
элемент и возвращает его.

```ts
import { CircularBuffer } from 'ds-kit-js';

const lastErrors = new CircularBuffer<string>(100);
lastErrors.push('timeout');
lastErrors.isFull();    // false
lastErrors.peekLast();  // 'timeout'
```

## LinkedList — односвязный список

Вставка в начало и в конец за O(1), операции по индексу — за O(n).
Есть `insertAt`, `removeAt`, `remove(value)`, `indexOf`, `includes` и `reverse()`
(разворачивает список на месте).

```ts
import { LinkedList } from 'ds-kit-js';

const list = new LinkedList([1, 2, 4]);
list.insertAt(2, 3);           // [1, 2, 3, 4]
list.reverse().toArray();      // [4, 3, 2, 1]
```

## DoublyLinkedList — двусвязный список

`push` и `unshift` возвращают **узел**. Сохраните его, чтобы потом удалить
(`removeNode`) или переместить в начало (`moveToFront`) за O(1) без поиска.
На этом приёме построен {@link LRUCache}.

```ts
import { DoublyLinkedList } from 'ds-kit-js';

const list = new DoublyLinkedList<string>();
const a = list.push('a');
list.push('b');
list.moveToFront(list.tailNode!); // ['b', 'a']
list.removeNode(a);               // ['b']
[...list.reversed()];             // обход с конца
```
