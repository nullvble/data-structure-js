# Changelog

## 1.1.0

- 15 примеров из реальных задач в `examples/`: rate limiter, кэш с TTL, планировщик задач,
  мониторинг, автодополнение, полнотекстовый поиск, undo/redo, таблица лидеров, порядок сборки,
  маршруты, веб-краулер, дедупликация клиентов, переговорные, курсы на дату, аналитика продаж.
  Запуск: `npm run examples`.
- Деревья поиска: `lower(v)` и `higher(v)` — строго предыдущий и следующий элементы.
- `SortedMap`: `lowerKey(k)` и `higherKey(k)`.

## 1.0.0

Первый релиз в npm под именем `ds-kit-js`.

- Проект переписан на TypeScript; сборка в ESM и CommonJS с декларациями типов.
- Новые структуры: `RedBlackTree`, `SkipList`, `SortedMap`, `SegmentTree`, `FenwickTree`,
  `BitSet`, `BloomFilter`, `CircularBuffer`, `MultiMap`.
- `Graph`: `edges()`, `connectedComponents()`, `minimumSpanningTree()`.
- Общий базовый класс `BinaryTree` для деревьев поиска: `get`, `range`, итеративные обходы.
- `BinaryHeap#pushPop`, `Trie#longestCommonPrefix`, `reverseCompare`.
- Документация: руководства в `docs/` и API-справочник на TypeDoc.
