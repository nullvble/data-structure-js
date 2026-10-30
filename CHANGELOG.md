# Changelog

## 1.0.0

Первый релиз в npm под именем `ds-kit-js`.

- Проект переписан на TypeScript; сборка в ESM и CommonJS с декларациями типов.
- Новые структуры: `RedBlackTree`, `SkipList`, `SortedMap`, `SegmentTree`, `FenwickTree`,
  `BitSet`, `BloomFilter`, `CircularBuffer`, `MultiMap`.
- `Graph`: `edges()`, `connectedComponents()`, `minimumSpanningTree()`.
- Общий базовый класс `BinaryTree` для деревьев поиска: `get`, `range`, итеративные обходы.
- `BinaryHeap#pushPop`, `Trie#longestCommonPrefix`, `reverseCompare`.
- Документация: руководства в `docs/` и API-справочник на TypeDoc.
