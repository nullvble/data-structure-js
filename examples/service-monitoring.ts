/**
 * Мониторинг сервиса: скользящие метрики по последним N запросам и алерт при деградации.
 *
 * CircularBuffer хранит только последние N замеров: память постоянна, сколько бы
 * запросов ни пришло, а добавление — O(1). По окну считаем среднее, p95 и долю ошибок
 * и поднимаем алерт, если SLA нарушен.
 *
 * Где пригодится: health-check и circuit breaker, мониторинг внешних API, FPS-счётчик,
 * «последние 100 строк лога», скользящие средние в торговых ботах.
 */
import { CircularBuffer } from 'ds-kit-js';

export interface Sample {
  latencyMs: number;
  ok: boolean;
}

export interface Sla {
  p95Ms: number;
  maxErrorRate: number;
}

export class SlidingMetrics {
  readonly #window: CircularBuffer<Sample>;

  constructor(windowSize: number) {
    this.#window = new CircularBuffer(windowSize);
  }

  record(sample: Sample): void {
    this.#window.push(sample);
  }

  stats(): { count: number; avgMs: number; p95Ms: number; errorRate: number } {
    const samples = this.#window.toArray();
    const latencies = samples.map((s) => s.latencyMs).sort((a, b) => a - b);
    const count = samples.length;
    return {
      count,
      avgMs: Math.round(latencies.reduce((sum, x) => sum + x, 0) / Math.max(count, 1)),
      p95Ms: latencies[Math.max(0, Math.ceil(count * 0.95) - 1)] ?? 0,
      errorRate: samples.filter((s) => !s.ok).length / Math.max(count, 1),
    };
  }

  violations({ p95Ms, maxErrorRate }: Sla): string[] {
    const s = this.stats();
    const problems: string[] = [];
    if (s.p95Ms > p95Ms) problems.push(`p95 ${s.p95Ms} мс > ${p95Ms} мс`);
    if (s.errorRate > maxErrorRate) problems.push(`ошибок ${(s.errorRate * 100).toFixed(0)}% > ${maxErrorRate * 100}%`);
    return problems;
  }
}

// ── Демонстрация: окно из 20 последних запросов к платёжному API ─────────────

const metrics = new SlidingMetrics(20);
const sla: Sla = { p95Ms: 300, maxErrorRate: 0.1 };

const phases: { label: string; latency: (i: number) => number; fails: (i: number) => boolean }[] = [
  { label: 'норма', latency: (i) => 80 + ((i * 17) % 60), fails: () => false },
  { label: 'деградация', latency: (i) => 250 + ((i * 53) % 400), fails: (i) => i % 4 === 0 },
  { label: 'восстановление', latency: (i) => 90 + ((i * 13) % 50), fails: () => false },
];

for (const phase of phases) {
  for (let i = 0; i < 20; i++) metrics.record({ latencyMs: phase.latency(i), ok: !phase.fails(i) });
  const { avgMs, p95Ms, errorRate } = metrics.stats();
  const problems = metrics.violations(sla);
  const status = problems.length ? `🚨 АЛЕРТ: ${problems.join(', ')}` : '✅ в норме';
  console.log(`${phase.label.padEnd(15)} avg ${avgMs} мс, p95 ${p95Ms} мс, ошибок ${(errorRate * 100).toFixed(0)}% → ${status}`);
}
