# ds-kit-js

[![npm](https://img.shields.io/npm/v/ds-kit-js.svg)](https://www.npmjs.com/package/ds-kit-js)
[![CI](https://github.com/nullvble/data-structure-js/actions/workflows/ci.yml/badge.svg)](https://github.com/nullvble/data-structure-js/actions/workflows/ci.yml)
[![types](https://img.shields.io/npm/types/ds-kit-js.svg)](https://www.npmjs.com/package/ds-kit-js)
[![license](https://img.shields.io/npm/l/ds-kit-js.svg)](./LICENSE)

Типизированные структуры данных, которых нет в стандартной библиотеке JavaScript:
очереди, деревья поиска, кучи, префиксные деревья, графы, кэши и вероятностные структуры.

*Typed data structures missing from the JavaScript standard library.*

- **TypeScript** — написано на TypeScript, обобщённые типы, встроенные `.d.ts`
- **Без зависимостей**, около 14 КБ в gzip, tree-shaking (`sideEffects: false`)
- **ESM и CommonJS**, Node.js 20+ и браузеры
- **Единый API**: `size`, `isEmpty()`, `clear()`, `toArray()`, `for...of`
- **Протестировано**: рандомизированная сверка с эталонными реализациями, проверка инвариантов деревьев

📖 **[Документация](https://nullvble.github.io/data-structure-js/)** · [Быстрый старт](./docs/getting-started.md) · [Как выбрать структуру](./docs/choosing.md)

## Установка

```bash
npm install ds-kit-js
```

## Пример

```ts
import { Queue, RedBlackTree, PriorityQueue, Graph, LRUCache } from 'ds-kit-js';

const queue = new Queue([1, 2, 3]);
queue.dequeue(); // 1 — за O(1), в отличие от Array#shift

const tree = new RedBlackTree([50, 20, 80, 10]);
tree.floor(60);          // 50
[...tree.range(15, 60)]; // [20, 50]

const tasks = new PriorityQueue<string>();
tasks.enqueue('отчёт', 2).enqueue('пожар', 0);
tasks.dequeue(); // 'пожар'

const map = new Graph<string>().addEdge('A', 'B', 4).addEdge('A', 'C', 2).addEdge('C', 'B', 1);
map.shortestPath('A', 'B'); // { distance: 3, path: ['A', 'C', 'B'] }

const cache = new LRUCache<string, number>(2);
cache.set('a', 1).set('b', 2).set('c', 3); // 'a' вытеснен
```

## Структуры

| Категория | Структуры | Руководство |
|---|---|---|
| Линейные | `Stack`, `Queue`, `Deque`, `CircularBuffer`, `LinkedList`, `DoublyLinkedList` | [linear.md](./docs/linear.md) |
| Упорядоченные | `BinarySearchTree`, `AVLTree`, `RedBlackTree`, `SkipList`, `SortedMap` | [ordered.md](./docs/ordered.md) |
| Кучи и строки | `BinaryHeap`, `MinHeap`, `MaxHeap`, `PriorityQueue`, `Trie` | [heaps-and-strings.md](./docs/heaps-and-strings.md) |
| Запросы на отрезках | `SegmentTree`, `FenwickTree` | [range-queries.md](./docs/range-queries.md) |
| Множества и кэши | `BitSet`, `BloomFilter`, `DisjointSet`, `MultiMap`, `LRUCache` | [sets-and-caches.md](./docs/sets-and-caches.md) |
| Графы | `Graph`: BFS, DFS, Дейкстра, топологическая сортировка, циклы, компоненты, MST (Краскал) | [graphs.md](./docs/graphs.md) |

Сложность всех операций сведена в таблицу в [choosing.md](./docs/choosing.md#сложность-операций).

## Разработка

```bash
npm install
npm test            # тесты (node:test + tsx)
npm run typecheck   # проверка типов
npm run build       # сборка в dist/ (ESM + CJS + .d.ts)
npm run test:dist   # проверка собранного пакета
npm run docs        # API-документация в docs/api
```

Структура репозитория:

```
src/       исходники, по одному файлу на структуру; src/index.ts — точка входа
test/      тесты
docs/      руководства (Markdown); docs/api — сгенерированная документация
scripts/   вспомогательные скрипты
```

## Публикация

Публикация в npm автоматизирована через GitHub Actions ([`release.yml`](./.github/workflows/release.yml)):

1. Один раз добавьте npm-токен в секрет репозитория `NPM_TOKEN`
   (Settings → Secrets and variables → Actions).
2. Поднимите версию и запушьте тег:

   ```bash
   npm version patch   # или minor / major — меняет package.json и создаёт тег vX.Y.Z
   git push --follow-tags
   ```

Workflow проверит, что тег совпадает с версией в `package.json`, прогонит тесты,
соберёт пакет и опубликует его с [provenance](https://docs.npmjs.com/generating-provenance-statements).

## Лицензия

[MIT](./LICENSE)
