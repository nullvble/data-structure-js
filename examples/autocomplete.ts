/**
 * Подсказки в строке поиска: по введённому префиксу показать самые популярные запросы.
 *
 * - Trie находит все запросы с данным префиксом за время, зависящее от длины префикса,
 *   а не от размера словаря.
 * - Из найденных выбираем k самых частых с помощью кучи размера k — O(m log k)
 *   вместо сортировки всех m кандидатов.
 *
 * Где пригодится: поиск по каталогу, адресная строка, выбор города или тега, командная палитра.
 */
import { BinaryHeap, Trie } from 'ds-kit-js';

interface Suggestion {
  query: string;
  count: number;
}

// На вершине кучи — наименее популярная из отобранных подсказок, её и вытесняем.
const byPopularity = (a: Suggestion, b: Suggestion): number => a.count - b.count || b.query.localeCompare(a.query);

export class Autocomplete {
  readonly #trie = new Trie();
  readonly #counts = new Map<string, number>();

  /** Учитывает запрос пользователя (например, из лога поиска). */
  record(query: string, times = 1): void {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;
    this.#trie.insert(normalized);
    this.#counts.set(normalized, (this.#counts.get(normalized) ?? 0) + times);
  }

  /** До `limit` самых популярных запросов, начинающихся с `prefix`. */
  suggest(prefix: string, limit = 5): Suggestion[] {
    const top = new BinaryHeap<Suggestion>([], byPopularity);
    for (const query of this.#trie.wordsWithPrefix(prefix.trim().toLowerCase())) {
      const suggestion = { query, count: this.#counts.get(query)! };
      if (top.size < limit) top.push(suggestion);
      else top.pushPop(suggestion);
    }
    return top.toSortedArray().reverse();
  }
}

// ── Демонстрация: подсказки по логу поисковых запросов ───────────────────────

const searchLog: [string, number][] = [
  ['купить iphone 15', 950],
  ['купить ноутбук', 720],
  ['купить ноутбук для учёбы', 180],
  ['купить кроссовки', 430],
  ['купить квартиру', 1200],
  ['купон на скидку', 310],
  ['курс доллара', 2500],
  ['курсы английского', 640],
  ['куртка зимняя', 280],
];

const autocomplete = new Autocomplete();
for (const [query, count] of searchLog) autocomplete.record(query, count);

for (const input of ['ку', 'купить', 'купить н', 'Курс']) {
  const hints = autocomplete.suggest(input, 3).map(({ query, count }) => `${query} (${count})`);
  console.log(`«${input}» → ${hints.join(' | ')}`);
}

// Пользователь выбрал подсказку — учитываем это, и она поднимется в выдаче.
autocomplete.record('купить ноутбук для учёбы', 600);
console.log(`после 600 выборов → ${autocomplete.suggest('купить н', 2).map((s) => s.query).join(' | ')}`);
