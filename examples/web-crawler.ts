/**
 * Обход сайта (краулер): собрать все страницы в пределах заданной глубины,
 * не заходя на одну страницу дважды.
 *
 * - Queue даёт обход в ширину: сначала главная, потом страницы в 1 клике, потом в 2…
 * - BloomFilter помнит посещённые URL: на миллионы адресов он занимает мегабайты,
 *   тогда как Set со строками — сотни мегабайт. Плата — небольшая доля ложных
 *   срабатываний (страница изредка будет пропущена), что для краулера приемлемо.
 *
 * Где пригодится: проверка битых ссылок, генерация sitemap.xml, SEO-аудит, сбор данных.
 */
import { BloomFilter, Queue } from 'ds-kit-js';

export interface CrawlOptions {
  maxDepth: number;
  /** Ожидаемое число страниц — от него зависит размер фильтра Блума. */
  expectedPages?: number;
}

/** Убирает якоря, лишние слэши и UTM-метки, чтобы одна страница не считалась разными. */
export function normalizeUrl(raw: string): string {
  const url = new URL(raw);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key);
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.toString();
}

export async function crawl(
  start: string,
  fetchLinks: (url: string) => Promise<string[]>,
  { maxDepth, expectedPages = 100_000 }: CrawlOptions,
): Promise<Map<string, number>> {
  const seen = new BloomFilter(expectedPages, 0.001);
  const depths = new Map<string, number>(); // результат: страница → глубина
  const queue = new Queue<[url: string, depth: number]>();

  const origin = new URL(start).origin;
  const visit = (url: string, depth: number): void => {
    const normalized = normalizeUrl(url);
    if (new URL(normalized).origin !== origin || seen.mightContain(normalized)) return;
    seen.add(normalized);
    queue.enqueue([normalized, depth]);
  };

  visit(start, 0);
  while (!queue.isEmpty()) {
    const [url, depth] = queue.dequeue()!;
    depths.set(url, depth);
    if (depth === maxDepth) continue;
    for (const link of await fetchLinks(url)) visit(new URL(link, url).toString(), depth + 1);
  }
  return depths;
}

// ── Демонстрация на «сайте» из памяти (вместо fetch + парсинга HTML) ──────────

const site: Record<string, string[]> = {
  'https://shop.example/': ['/catalog', '/about', '/catalog?utm_source=mail', 'https://vk.com/shop'],
  'https://shop.example/catalog': ['/catalog/phones', '/catalog/laptops/', '/'],
  'https://shop.example/about': ['/contacts', '/about#team'],
  'https://shop.example/catalog/phones': ['/catalog/phones/iphone-15', '/catalog'],
  'https://shop.example/catalog/laptops': ['/catalog/laptops/macbook-air'],
  'https://shop.example/contacts': [],
};

const pages = await crawl('https://shop.example/', async (url) => site[url] ?? [], { maxDepth: 2 });
for (const [url, depth] of pages) console.log(`${'  '.repeat(depth)}${new URL(url).pathname} (глубина ${depth})`);
console.log(`Найдено страниц: ${pages.size}; глубже 2 кликов не заходили, внешние ссылки пропущены`);
