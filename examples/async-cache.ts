/**
 * Кэширование результатов асинхронных функций: LRU + время жизни (TTL) + склейка
 * одновременных запросов.
 *
 * - LRUCache ограничивает память: при переполнении вытесняются давно не нужные записи.
 * - TTL: запись считается устаревшей через `ttlMs` и загружается заново.
 * - Если 10 обработчиков одновременно запросили одного и того же пользователя,
 *   в базу уйдёт один запрос, а остальные дождутся его результата.
 *
 * Где пригодится: запросы к БД и внешним API, тяжёлые вычисления, рендер страниц.
 */
import { LRUCache } from 'ds-kit-js';

export interface CacheOptions {
  /** Максимум записей в кэше. */
  max: number;
  /** Время жизни записи в миллисекундах. */
  ttlMs: number;
  /** Источник времени — подменяется в тестах. */
  now?: () => number;
}

export function cached<K, V>(load: (key: K) => Promise<V>, { max, ttlMs, now = Date.now }: CacheOptions) {
  const cache = new LRUCache<K, { value: V; expiresAt: number }>(max);
  const inFlight = new Map<K, Promise<V>>();

  const get = async (key: K): Promise<V> => {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now()) return hit.value;

    const pending = inFlight.get(key);
    if (pending) return pending;

    const promise = load(key)
      .then((value) => {
        cache.set(key, { value, expiresAt: now() + ttlMs });
        return value;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  };

  /** Сбросить запись, например после обновления пользователя. */
  const invalidate = (key: K): boolean => cache.delete(key);

  return { get, invalidate };
}

// ── Демонстрация ─────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
}

let clock = 0;
let dbQueries = 0;

async function loadUserFromDb(id: number): Promise<User> {
  dbQueries++;
  await new Promise((resolve) => setTimeout(resolve, 5)); // имитация задержки сети
  return { id, name: `user-${id}` };
}

const users = cached(loadUserFromDb, { max: 2, ttlMs: 60_000, now: () => clock });

await Promise.all(Array.from({ length: 10 }, () => users.get(1)));
console.log(`10 одновременных запросов user 1 → запросов в БД: ${dbQueries}`); // 1

await users.get(1);
console.log(`повторный запрос из кэша → запросов в БД: ${dbQueries}`); // 1

await users.get(2);
await users.get(3); // кэш на 2 записи: вытесняется user 1, к которому дольше всего не обращались
await users.get(1);
console.log(`после вытеснения user 1 загружен заново → запросов в БД: ${dbQueries}`); // 4

clock += 61_000; // прошла минута — записи устарели
await users.get(1);
console.log(`после истечения TTL → запросов в БД: ${dbQueries}`); // 5
