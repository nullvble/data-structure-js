# data-structure-js

Классические структуры данных, которых нет в стандартной библиотеке JavaScript.
Чистый JS (ES-модули), без зависимостей, с тестами на встроенном `node:test`.

## Состав

| Структура | Файл | Основные операции | Сложность |
|---|---|---|---|
| `Stack` — стек (LIFO) | `src/Stack.js` | `push`, `pop`, `peek` | O(1) |
| `Queue` — очередь (FIFO) на кольцевом буфере | `src/Queue.js` | `enqueue`, `dequeue`, `peek` | O(1)* |
| `Deque` — двусторонняя очередь | `src/Deque.js` | `pushFront/Back`, `popFront/Back`, `at` | O(1)* |
| `LinkedList` — односвязный список | `src/LinkedList.js` | `append`, `prepend`, `insertAt`, `removeAt`, `reverse` | O(1) / O(n) |
| `DoublyLinkedList` — двусвязный список | `src/DoublyLinkedList.js` | `push`, `unshift`, `pop`, `shift`, `removeNode` | O(1) |
| `BinarySearchTree` — двоичное дерево поиска | `src/BinarySearchTree.js` | `insert`, `has`, `delete`, `min/max`, `floor/ceil`, обходы | O(h) |
| `AVLTree` — сбалансированное дерево поиска | `src/AVLTree.js` | `insert`, `has`, `delete`, `min/max` | O(log n) |
| `BinaryHeap`, `MinHeap`, `MaxHeap` — двоичная куча | `src/BinaryHeap.js` | `push`, `pop`, `peek` | O(log n) |
| `PriorityQueue` — очередь с приоритетом (стабильная) | `src/PriorityQueue.js` | `enqueue(value, priority)`, `dequeue` | O(log n) |
| `Trie` — префиксное дерево | `src/Trie.js` | `insert`, `has`, `hasPrefix`, `wordsWithPrefix`, `delete` | O(L) |
| `DisjointSet` — Union-Find | `src/DisjointSet.js` | `union`, `find`, `connected`, `groups` | ≈O(1) |
| `LRUCache` — LRU-кэш | `src/LRUCache.js` | `get`, `set`, `peek`, `delete` | O(1) |
| `Graph` — граф (ориентированный/неориентированный, взвешенный) | `src/Graph.js` | `bfs`, `dfs`, `shortestPath` (Дейкстра), `topologicalSort`, `hasCycle` | — |

\* амортизированно

Все коллекции поддерживают `size`, `isEmpty()`, `clear()`, `toArray()` и протокол итерации (`for...of`, spread).
Деревья и кучи принимают собственный компаратор `(a, b) => number`.

## Использование

```js
import { Queue, BinarySearchTree, PriorityQueue, Graph, LRUCache } from './src/index.js';

const q = new Queue([1, 2, 3]);
q.enqueue(4);
q.dequeue(); // 1

const bst = new BinarySearchTree([8, 3, 10, 1, 6]);
bst.has(6);        // true
[...bst];          // [1, 3, 6, 8, 10]
bst.floor(7);      // 6

const users = new BinarySearchTree([], (a, b) => a.age - b.age);
users.insert({ name: 'Аня', age: 30 });

const pq = new PriorityQueue();
pq.enqueue('низкий', 5).enqueue('срочно', 1);
pq.dequeue(); // 'срочно'

const g = new Graph()
  .addEdge('A', 'B', 4)
  .addEdge('A', 'C', 2)
  .addEdge('C', 'B', 1);
g.shortestPath('A', 'B'); // { distance: 3, path: ['A', 'C', 'B'] }

const cache = new LRUCache(2);
cache.set('a', 1).set('b', 2).set('c', 3); // 'a' вытеснен
```

## Тесты

```bash
npm test
```

Требуется Node.js 22+.
