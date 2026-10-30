---
title: Кучи и строки
group: Структуры
---

# Кучи, очередь с приоритетом и префиксное дерево

## BinaryHeap, MinHeap, MaxHeap

Куча мгновенно отдаёт минимальный (или максимальный) элемент, а `push`
и `pop` выполняются за O(log n). Если передать данные в конструктор,
куча строится за O(n).

```ts
import { BinaryHeap, MaxHeap, MinHeap } from 'ds-kit-js';

new MinHeap([5, 1, 3]).pop(); // 1
new MaxHeap([5, 1, 3]).pop(); // 5

// k наибольших элементов за O(n log k)
function topK(nums: number[], k: number): number[] {
  const heap = new MinHeap<number>();
  for (const n of nums) {
    if (heap.size < k) heap.push(n);
    else heap.pushPop(n); // быстрее, чем push + pop
  }
  return heap.toSortedArray().reverse();
}

// Куча объектов по своему критерию
const events = new BinaryHeap<{ at: number; name: string }>([], (a, b) => a.at - b.at);
```

`toArray()` и итерация возвращают элементы **в порядке хранения**, а не в отсортированном.
Если нужен отсортированный порядок, используйте `toSortedArray()`: куча при этом не изменяется.

## PriorityQueue

Обёртка над кучей, в которой приоритет передаётся отдельно от значения.
Меньшее число означает более высокий приоритет. При равных приоритетах элементы
извлекаются в порядке добавления (очередь стабильна).

```ts
import { PriorityQueue } from 'ds-kit-js';

const tasks = new PriorityQueue<string>();
tasks.enqueue('отправить отчёт', 2);
tasks.enqueue('починить прод', 0);
tasks.enqueue('ответить на письмо', 2);

tasks.dequeue(); // 'починить прод'
tasks.dequeue(); // 'отправить отчёт' — добавлен раньше письма
```

## Trie — префиксное дерево

Хранит множество строк так, что поиск слова или префикса занимает O(L),
где L — длина строки, сколько бы слов ни было в дереве. Поддерживает Unicode,
включая кириллицу и эмодзи.

```ts
import { Trie } from 'ds-kit-js';

const dictionary = new Trie(['кот', 'код', 'кода', 'дом']);

dictionary.has('код');               // true
dictionary.hasPrefix('ко');          // true
dictionary.wordsWithPrefix('ко');    // ['код', 'кода', 'кот']
dictionary.delete('кода');
new Trie(['flower', 'flow', 'flight']).longestCommonPrefix(); // 'fl'
```
