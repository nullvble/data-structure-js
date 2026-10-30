/**
 * Полнотекстовый поиск по каталогу товаров с фильтрами И / ИЛИ / НЕ.
 *
 * Строим обратный индекс «слово → множество документов». Множества храним в BitSet:
 * один бит на документ, поэтому индекс компактный, а пересечение и объединение
 * выполняются словами по 32 бита — в десятки раз быстрее, чем с обычными Set.
 * Найденные товары группируем по категориям с помощью MultiMap.
 *
 * Где пригодится: фильтры в интернет-магазине, поиск по заметкам или логам,
 * фасетный поиск без Elasticsearch на небольших объёмах данных.
 */
import { BitSet, MultiMap } from 'ds-kit-js';

export interface Product {
  title: string;
  category: string;
}

export class SearchIndex {
  readonly #docs: Product[];
  readonly #index = new Map<string, BitSet>();

  constructor(docs: Product[]) {
    this.#docs = docs;
    docs.forEach((doc, id) => {
      for (const word of tokenize(doc.title)) {
        let set = this.#index.get(word);
        if (!set) this.#index.set(word, (set = new BitSet(docs.length)));
        set.set(id);
      }
    });
  }

  /**
   * Товары, где есть все слова из `all`, хотя бы одно из `any` (если задано) и нет слов из `none`.
   */
  search({ all = [], any = [], none = [] }: { all?: string[]; any?: string[]; none?: string[] }): Product[] {
    let result = this.#everything();
    for (const word of all) result = result.intersection(this.#lookup(word));
    if (any.length) result = result.intersection(any.map((w) => this.#lookup(w)).reduce((a, b) => a.union(b)));
    for (const word of none) result = result.difference(this.#lookup(word));
    return result.toArray().map((id) => this.#docs[id]!);
  }

  #lookup(word: string): BitSet {
    return this.#index.get(normalize(word)) ?? new BitSet(this.#docs.length);
  }

  #everything(): BitSet {
    return BitSet.from(this.#docs.keys(), this.#docs.length);
  }
}

const normalize = (word: string): string => word.toLowerCase().replace(/ё/g, 'е');
const tokenize = (text: string): string[] => text.split(/[^\p{L}\p{N}]+/u).filter(Boolean).map(normalize);

// ── Демонстрация ─────────────────────────────────────────────────────────────

const catalog = new SearchIndex([
  { title: 'Ноутбук Lenovo 16 ГБ SSD 512', category: 'Ноутбуки' },
  { title: 'Ноутбук игровой ASUS 32 ГБ', category: 'Ноутбуки' },
  { title: 'Чехол для ноутбука 15 дюймов', category: 'Аксессуары' },
  { title: 'SSD накопитель Samsung 1 ТБ', category: 'Комплектующие' },
  { title: 'Оперативная память 16 ГБ DDR5', category: 'Комплектующие' },
  { title: 'Монитор игровой 27 дюймов', category: 'Мониторы' },
  { title: 'Ноутбук Apple 16 ГБ', category: 'Ноутбуки' },
]);

const show = (label: string, products: Product[]): void => {
  const groups = MultiMap.groupBy(products, (p) => p.category);
  console.log(label);
  for (const [category, items] of groups.groups()) {
    console.log(`  ${category}: ${items.map((p) => p.title).join('; ')}`);
  }
};

show('ноутбук И 16:', catalog.search({ all: ['ноутбук', '16'] }));
show('игровой, кроме ноутбуков:', catalog.search({ all: ['игровой'], none: ['ноутбук'] }));
show('ssd ИЛИ ddr5:', catalog.search({ any: ['ssd', 'ddr5'] }));
