/**
 * Ограничение частоты запросов к API (rate limiting) по алгоритму «скользящее окно».
 *
 * Задача: каждый клиент может сделать не больше `limit` запросов за `windowMs`.
 * Для каждого клиента храним время его последних запросов в Deque: новые добавляем
 * в конец, устаревшие удаляем из начала — обе операции O(1).
 *
 * Где пригодится: middleware для Express/Fastify, защита от перебора паролей,
 * ограничение вызовов платного внешнего API.
 */
import { Deque } from 'ds-kit-js';

export interface RateLimitResult {
  allowed: boolean;
  /** Сколько осталось запросов в текущем окне. */
  remaining: number;
  /** Через сколько мс можно повторить, если запрос отклонён. */
  retryAfterMs: number;
}

export class SlidingWindowRateLimiter {
  readonly #hits = new Map<string, Deque<number>>();
  readonly #limit: number;
  readonly #windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.#limit = limit;
    this.#windowMs = windowMs;
  }

  tryAcquire(clientId: string, now = Date.now()): RateLimitResult {
    let hits = this.#hits.get(clientId);
    if (!hits) this.#hits.set(clientId, (hits = new Deque()));

    // Выбрасываем запросы, которые вышли за пределы окна.
    while (!hits.isEmpty() && hits.peekFront()! <= now - this.#windowMs) hits.popFront();

    if (hits.size < this.#limit) {
      hits.pushBack(now);
      return { allowed: true, remaining: this.#limit - hits.size, retryAfterMs: 0 };
    }
    // Освободится место, когда самый старый запрос выйдет из окна.
    return { allowed: false, remaining: 0, retryAfterMs: hits.peekFront()! + this.#windowMs - now };
  }

  /** Удаляет клиентов без запросов в текущем окне — вызывайте периодически, чтобы не копить память. */
  cleanup(now = Date.now()): void {
    for (const [clientId, hits] of this.#hits) {
      if (hits.isEmpty() || hits.peekBack()! <= now - this.#windowMs) this.#hits.delete(clientId);
    }
  }
}

// ── Демонстрация: не больше 3 запросов в секунду ─────────────────────────────

const limiter = new SlidingWindowRateLimiter(3, 1000);
const requests: [time: number, client: string][] = [
  [0, 'alice'], [100, 'alice'], [200, 'bob'], [250, 'alice'],
  [300, 'alice'], // 4-й запрос alice за секунду — отклоняется
  [999, 'alice'], // всё ещё в том же окне
  [1001, 'alice'], // запрос из момента 0 вышел из окна — снова можно
];

for (const [time, client] of requests) {
  const { allowed, remaining, retryAfterMs } = limiter.tryAcquire(client, time);
  const status = allowed ? `✅ ok, осталось ${remaining}` : `⛔ 429 Too Many Requests, повторите через ${retryAfterMs} мс`;
  console.log(`t=${String(time).padStart(4)} мс  ${client.padEnd(5)}  ${status}`);
}

// Так это выглядит в Express:
//
//   app.use((req, res, next) => {
//     const r = limiter.tryAcquire(req.ip);
//     res.set('X-RateLimit-Remaining', String(r.remaining));
//     if (r.allowed) return next();
//     res.set('Retry-After', String(Math.ceil(r.retryAfterMs / 1000))).status(429).end();
//   });
