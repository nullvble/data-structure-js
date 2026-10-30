---
title: Множества, хэширование и кэши
group: Структуры
---

# Множества, хэширование и кэши

## BitSet — битовое множество

Хранит множество целых чисел из диапазона `[0, size)` по одному биту на число:
миллион флагов занимает около 122 КБ, тогда как `Set` потребовал бы десятки мегабайт.

```ts
import { BitSet } from 'ds-kit-js';

// Решето Эратосфена
function primes(limit: number): number[] {
  const composite = new BitSet(limit + 1);
  for (let i = 2; i * i <= limit; i++) {
    if (!composite.has(i)) for (let j = i * i; j <= limit; j += i) composite.set(j);
  }
  return Array.from({ length: limit - 1 }, (_, i) => i + 2).filter((n) => !composite.has(n));
}

const a = BitSet.from([1, 2, 3], 8);
const b = BitSet.from([2, 3, 4], 8);
a.intersection(b).toArray(); // [2, 3]
a.union(b).count();          // 4
```

## BloomFilter — фильтр Блума

Отвечает на вопрос «встречался ли элемент?» и почти не расходует память.
Ответ `false` всегда точен. Ответ `true` может оказаться ложным с вероятностью,
которую вы задаёте при создании фильтра. Удалять элементы нельзя.

```ts
import { BloomFilter } from 'ds-kit-js';

// ~1 млн URL при 1 % ложных срабатываний — около 1,2 МБ
const crawled = new BloomFilter(1_000_000, 0.01);

crawled.add('https://example.com/');
if (!crawled.mightContain(url)) {
  // точно новый URL — скачиваем
}

crawled.bitCount;                     // размер битового массива
crawled.hashCount;                    // число хэш-функций
crawled.estimatedFalsePositiveRate(); // текущая оценка вероятности ошибки
```

Размер битового массива `m` и число хэш-функций `k` вычисляются по стандартным
формулам: `m = −n·ln p / (ln 2)²`, `k = (m / n)·ln 2`.

## DisjointSet — система непересекающихся множеств

Union-Find со сжатием путей и объединением по рангу. Позволяет объединять группы
элементов и проверять, лежат ли два элемента в одной группе, почти за O(1).

```ts
import { DisjointSet } from 'ds-kit-js';

const friends = new DisjointSet<string>();
friends.union('Аня', 'Боря');
friends.union('Боря', 'Вика');
friends.union('Гена', 'Дима');

friends.connected('Аня', 'Вика'); // true
friends.setCount;                 // 2
friends.groups();                 // [['Аня', 'Боря', 'Вика'], ['Гена', 'Дима']]
```

## MultiMap — словарь с несколькими значениями

```ts
import { MultiMap } from 'ds-kit-js';

const byCity = MultiMap.groupBy(users, (u) => u.city);
byCity.get('Казань'); // все пользователи из Казани
byCity.count('Казань');
byCity.keyCount;      // число городов
byCity.size;          // число пользователей

const index = new MultiMap<string, number>();
index.add('js', 1).add('js', 2).add('ts', 2);
index.deleteEntry('js', 1);
[...index];           // [['js', 2], ['ts', 2]]
```

## LRUCache — кэш с вытеснением

Хранит не более `capacity` записей. Когда места не хватает, удаляется запись,
к которой дольше всего не обращались. Все операции — O(1).

```ts
import { LRUCache } from 'ds-kit-js';

const cache = new LRUCache<string, Response>(500);

async function cachedFetch(url: string): Promise<Response> {
  const hit = cache.get(url); // get отмечает запись как недавно использованную
  if (hit) return hit.clone();
  const response = await fetch(url);
  cache.set(url, response.clone());
  return response;
}

cache.peek(url); // прочитать, не меняя порядок вытеснения
cache.keys();    // от самого свежего к самому старому
```
