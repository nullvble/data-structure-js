/**
 * Таблица лидеров онлайн-игры: очки игроков постоянно меняются, а нужно быстро
 * показывать топ-N, место конкретного игрока и его соседей по рейтингу.
 *
 * - RedBlackTree хранит игроков отсортированными по очкам (по убыванию) — топ и соседи
 *   достаются без сортировки, обновление очков — O(log n).
 * - FenwickTree считает, сколько игроков набрало каждое количество очков, поэтому место
 *   игрока («сколько людей выше меня») вычисляется за O(log maxScore), без обхода таблицы.
 *
 * Где пригодится: игры, рейтинги продавцов и курьеров, соревнования, геймификация.
 */
import { FenwickTree, RedBlackTree } from 'ds-kit-js';

interface Entry {
  player: string;
  score: number;
}

export class Leaderboard {
  // Больше очков — выше; при равенстве — по имени, чтобы порядок был стабильным.
  readonly #ranking = new RedBlackTree<Entry>([], (a, b) => b.score - a.score || a.player.localeCompare(b.player));
  readonly #byPlayer = new Map<string, Entry>();
  readonly #scoreCounts: FenwickTree;
  readonly #maxScore: number;

  constructor(maxScore: number) {
    this.#maxScore = maxScore;
    this.#scoreCounts = new FenwickTree(maxScore + 1);
  }

  setScore(player: string, score: number): void {
    if (score < 0 || score > this.#maxScore) throw new RangeError(`score must be in [0, ${this.#maxScore}]`);
    const old = this.#byPlayer.get(player);
    if (old) {
      this.#ranking.delete(old);
      this.#scoreCounts.add(old.score, -1);
    }
    const entry = { player, score };
    this.#ranking.insert(entry);
    this.#byPlayer.set(player, entry);
    this.#scoreCounts.add(score, 1);
  }

  /** Место игрока: 1 + число игроков со строго большим счётом (одинаковый счёт — одно место). */
  rank(player: string): number | undefined {
    const entry = this.#byPlayer.get(player);
    if (!entry) return undefined;
    return 1 + this.#scoreCounts.rangeSum(entry.score + 1, this.#maxScore + 1);
  }

  top(n: number): Entry[] {
    const result: Entry[] = [];
    for (const entry of this.#ranking) {
      if (result.length === n) break;
      result.push(entry);
    }
    return result;
  }

  /** Ближайшие соседи игрока сверху и снизу по таблице — O(log n). */
  neighbors(player: string): { above: Entry | undefined; below: Entry | undefined } {
    const entry = this.#byPlayer.get(player);
    if (!entry) return { above: undefined, below: undefined };
    return { above: this.#ranking.lower(entry), below: this.#ranking.higher(entry) };
  }
}

// ── Демонстрация ─────────────────────────────────────────────────────────────

const board = new Leaderboard(100_000);
const scores: [string, number][] = [
  ['Neo', 4200], ['Trinity', 5100], ['Morpheus', 3900], ['Smith', 5100], ['Oracle', 2500], ['Tank', 3100],
];
for (const [player, score] of scores) board.setScore(player, score);

const printTop = (): void =>
  console.log(board.top(3).map((e, i) => `${i + 1}. ${e.player} — ${e.score}`).join('   '));

printTop();
console.log(`Neo на ${board.rank('Neo')} месте; Smith и Trinity делят ${board.rank('Smith')}-е`);

board.setScore('Neo', 6000); // Нео прошёл сложный уровень
printTop();
const { above, below } = board.neighbors('Morpheus');
console.log(`Morpheus: ${board.rank('Morpheus')}-е место, выше — ${above?.player}, ниже — ${below?.player}`);
