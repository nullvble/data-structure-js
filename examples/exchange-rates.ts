/**
 * История значений во времени: курс валют на любую дату, изменения за период,
 * ближайшие соседние точки.
 *
 * Курс публикуется не каждый день (выходные, праздники), и «курс на дату» — это последнее
 * опубликованное значение не позже этой даты. SortedMap хранит даты отсортированными и
 * отвечает на такой запрос через `floorKey` за O(log n); выборка за период — `entriesBetween`.
 *
 * Где пригодится: курсы и цены, тарифы и ставки, действующие с определённой даты,
 * версии конфигурации, «состояние на момент T» в аудите.
 */
import { SortedMap } from 'ds-kit-js';

export class TimeSeries {
  // Даты в формате ГГГГ-ММ-ДД сравниваются как строки в правильном хронологическом порядке.
  readonly #points = new SortedMap<string, number>();

  set(date: string, value: number): this {
    this.#points.set(date, value);
    return this;
  }

  /** Значение, действовавшее на дату: последняя точка не позже `date`. */
  at(date: string): { date: string; value: number } | undefined {
    const key = this.#points.floorKey(date);
    return key === undefined ? undefined : { date: key, value: this.#points.get(key)! };
  }

  /** Изменение за период [from, to] по фактически действовавшим значениям. */
  change(from: string, to: string): number | undefined {
    const start = this.at(from);
    const end = this.at(to);
    return start && end ? end.value - start.value : undefined;
  }

  between(from: string, to: string): [string, number][] {
    return [...this.#points.entriesBetween(from, to)];
  }
}

// ── Демонстрация (значения условные) ─────────────────────────────────────────

const usd = new TimeSeries()
  .set('2026-03-02', 90.12)
  .set('2026-03-03', 90.45)
  .set('2026-03-04', 91.02)
  .set('2026-03-05', 90.77)
  .set('2026-03-06', 89.95) // пятница; в выходные курс не публикуется
  .set('2026-03-10', 90.3);

for (const date of ['2026-03-04', '2026-03-08', '2026-03-01']) {
  const rate = usd.at(date);
  console.log(`Курс на ${date}: ${rate ? `${rate.value} ₽ (опубликован ${rate.date})` : 'нет данных'}`);
}
console.log(`Изменение за 03.03–09.03: ${usd.change('2026-03-03', '2026-03-09')?.toFixed(2)} ₽`);
console.log('Котировки за 04.03–09.03:', usd.between('2026-03-04', '2026-03-09').map(([d, v]) => `${d.slice(5)}: ${v}`).join(', '));
