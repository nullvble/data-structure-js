/**
 * Планировщик отложенных задач с приоритетами и повторами при ошибках.
 *
 * Задачи лежат в BinaryHeap, упорядоченной по времени запуска (а при равном времени —
 * по приоритету), поэтому ближайшая задача всегда доступна за O(1), а добавление — O(log n).
 * Упавшая задача перезапускается с экспоненциальной задержкой: 1 с, 2 с, 4 с…
 *
 * Где пригодится: отправка писем и уведомлений, вебхуки, фоновая обработка,
 * «напомнить через час», очереди наподобие BullMQ без Redis.
 */
import { BinaryHeap } from 'ds-kit-js';

export interface JobOptions {
  /** Задержка перед первым запуском, мс. */
  delayMs?: number;
  /** Меньше число — выше приоритет при одинаковом времени запуска. */
  priority?: number;
  maxAttempts?: number;
}

interface Job {
  name: string;
  run: () => Promise<void> | void;
  runAt: number;
  priority: number;
  attempt: number;
  maxAttempts: number;
}

export class JobScheduler {
  readonly #queue = new BinaryHeap<Job>([], (a, b) => a.runAt - b.runAt || a.priority - b.priority);
  /** Виртуальные часы: в продакшене здесь было бы Date.now() и setTimeout до ближайшей задачи. */
  now = 0;

  schedule(name: string, run: Job['run'], { delayMs = 0, priority = 0, maxAttempts = 3 }: JobOptions = {}): void {
    this.#queue.push({ name, run, runAt: this.now + delayMs, priority, attempt: 1, maxAttempts });
  }

  /** Выполняет задачи в порядке времени запуска, пока очередь не опустеет. */
  async runAll(log: (message: string) => void = console.log): Promise<void> {
    while (!this.#queue.isEmpty()) {
      const job = this.#queue.pop()!;
      this.now = Math.max(this.now, job.runAt);
      const time = `[${(this.now / 1000).toFixed(1).padStart(5)} с]`;
      try {
        await job.run();
        log(`${time} ✅ ${job.name}`);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        if (job.attempt >= job.maxAttempts) {
          log(`${time} ❌ ${job.name}: ${reason} — попытки исчерпаны`);
          continue;
        }
        const backoff = 1000 * 2 ** (job.attempt - 1);
        log(`${time} ⚠️  ${job.name}: ${reason} — повтор через ${backoff / 1000} с`);
        this.#queue.push({ ...job, attempt: job.attempt + 1, runAt: this.now + backoff });
      }
    }
  }
}

// ── Демонстрация ─────────────────────────────────────────────────────────────

const scheduler = new JobScheduler();

let webhookCalls = 0;
scheduler.schedule('вебхук в CRM', () => {
  if (++webhookCalls < 3) throw new Error('503 Service Unavailable');
});
scheduler.schedule('письмо «Добро пожаловать»', () => {}, { delayMs: 500 });
scheduler.schedule('сброс пароля (срочно)', () => {}, { delayMs: 500, priority: -1 });
scheduler.schedule('напоминание о корзине', () => {}, { delayMs: 3600_000 });
scheduler.schedule('синхронизация с 1С', () => {
  throw new Error('timeout');
}, { maxAttempts: 2 });

await scheduler.runAll();
