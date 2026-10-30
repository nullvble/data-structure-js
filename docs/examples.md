---
title: Примеры из реальных задач
group: Руководство
---

# Примеры из реальных задач

В репозитории в папке [`examples/`](https://github.com/nullvble/data-structure-js/tree/master/examples)
лежат 15 готовых примеров. В каждом — класс или функция, которую можно перенести в свой проект,
и демонстрация с выводом.

| Пример | Задача | Структуры |
|---|---|---|
| [rate-limiter](https://github.com/nullvble/data-structure-js/blob/master/examples/rate-limiter.ts) | Ограничение частоты запросов к API | {@link Deque} |
| [async-cache](https://github.com/nullvble/data-structure-js/blob/master/examples/async-cache.ts) | Кэш асинхронных функций с TTL и склейкой запросов | {@link LRUCache} |
| [job-scheduler](https://github.com/nullvble/data-structure-js/blob/master/examples/job-scheduler.ts) | Отложенные задачи с приоритетами и повторами | {@link BinaryHeap} |
| [service-monitoring](https://github.com/nullvble/data-structure-js/blob/master/examples/service-monitoring.ts) | Скользящие метрики и алерты по SLA | {@link CircularBuffer} |
| [autocomplete](https://github.com/nullvble/data-structure-js/blob/master/examples/autocomplete.ts) | Подсказки в строке поиска | {@link Trie}, {@link BinaryHeap} |
| [search-index](https://github.com/nullvble/data-structure-js/blob/master/examples/search-index.ts) | Поиск по каталогу с И / ИЛИ / НЕ | {@link BitSet}, {@link MultiMap} |
| [undo-redo](https://github.com/nullvble/data-structure-js/blob/master/examples/undo-redo.ts) | Отмена и повтор в редакторе | {@link Deque}, {@link Stack} |
| [leaderboard](https://github.com/nullvble/data-structure-js/blob/master/examples/leaderboard.ts) | Таблица лидеров с местом игрока | {@link RedBlackTree}, {@link FenwickTree} |
| [build-order](https://github.com/nullvble/data-structure-js/blob/master/examples/build-order.ts) | Порядок сборки монорепозитория | {@link Graph} |
| [delivery-routes](https://github.com/nullvble/data-structure-js/blob/master/examples/delivery-routes.ts) | Маршрут курьера и минимальная сеть | {@link Graph} |
| [web-crawler](https://github.com/nullvble/data-structure-js/blob/master/examples/web-crawler.ts) | Обход сайта без повторов | {@link Queue}, {@link BloomFilter} |
| [merge-accounts](https://github.com/nullvble/data-structure-js/blob/master/examples/merge-accounts.ts) | Поиск дублей клиентов в CRM | {@link DisjointSet} |
| [meeting-rooms](https://github.com/nullvble/data-structure-js/blob/master/examples/meeting-rooms.ts) | Распределение встреч по переговорным | {@link BinaryHeap} |
| [exchange-rates](https://github.com/nullvble/data-structure-js/blob/master/examples/exchange-rates.ts) | Значение на дату и изменения за период | {@link SortedMap} |
| [sales-analytics](https://github.com/nullvble/data-structure-js/blob/master/examples/sales-analytics.ts) | Выручка и лучший день за любой период | {@link FenwickTree}, {@link SegmentTree} |

Запуск из клона репозитория:

```bash
npm run examples                    # все примеры
npm run examples -- leaderboard     # один пример
```
