/**
 * Аналитика продаж по дням: выручка за произвольный период и лучший день периода,
 * причём данные задним числом исправляются (возвраты, поздние заказы).
 *
 * Пересчитывать сумму по массиву на каждый запрос — O(n). FenwickTree даёт сумму
 * за период за O(log n), SegmentTree — максимум за период тоже за O(log n);
 * исправление одного дня — O(log n) в обеих структурах.
 *
 * Где пригодится: дашборды и отчёты, биллинг за период, мониторинг метрик,
 * игровая статистика, любые «сумма/минимум/максимум за окно» по часто меняющимся данным.
 */
import { FenwickTree, SegmentTree } from 'ds-kit-js';

interface DayStats {
  revenue: number;
  day: number;
}

export class SalesReport {
  readonly #revenue: FenwickTree;
  readonly #best: SegmentTree<DayStats>;

  constructor(dailyRevenue: number[]) {
    this.#revenue = new FenwickTree(dailyRevenue);
    // Храним пары «выручка + номер дня», чтобы максимум сразу говорил, какой это день.
    const better = (a: DayStats, b: DayStats): DayStats => (b.revenue > a.revenue ? b : a);
    this.#best = new SegmentTree(dailyRevenue.map((revenue, day) => ({ revenue, day })), better, { revenue: -Infinity, day: -1 });
  }

  /** Выручка за дни с `fromDay` по `toDay` включительно (дни нумеруются с 1). */
  total(fromDay: number, toDay: number): number {
    return this.#revenue.rangeSum(fromDay - 1, toDay);
  }

  bestDay(fromDay: number, toDay: number): DayStats {
    const best = this.#best.query(fromDay - 1, toDay);
    return { revenue: best.revenue, day: best.day + 1 };
  }

  /** Корректировка задним числом: возврат (отрицательная сумма) или поздний заказ. */
  adjust(day: number, delta: number): void {
    this.#revenue.add(day - 1, delta);
    const current = this.#best.get(day - 1);
    this.#best.set(day - 1, { ...current, revenue: current.revenue + delta });
  }
}

// ── Демонстрация: выручка магазина за 30 дней ────────────────────────────────

// Детерминированные «случайные» данные: базовая выручка + пик по выходным.
const revenue = Array.from({ length: 30 }, (_, i) => 100_000 + ((i * 37_919) % 50_000) + (i % 7 >= 5 ? 80_000 : 0));
const report = new SalesReport(revenue);
const rub = (n: number): string => `${n.toLocaleString('ru-RU')} ₽`;

console.log(`Выручка за 1–7 день: ${rub(report.total(1, 7))}`);
console.log(`Выручка за месяц: ${rub(report.total(1, 30))}`);
let best = report.bestDay(8, 21);
console.log(`Лучший день с 8 по 21: день ${best.day}, ${rub(best.revenue)}`);

report.adjust(best.day, -150_000); // крупный возврат по заказу этого дня
best = report.bestDay(8, 21);
console.log(`После возврата: выручка 8–21 = ${rub(report.total(8, 21))}, лучший день теперь ${best.day} (${rub(best.revenue)})`);
