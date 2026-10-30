/**
 * Порядок сборки пакетов в монорепозитории — как в Turborepo, Nx или `npm run build --workspaces`.
 *
 * Зависимости — ориентированный граф: ребро «utils → api» значит «api зависит от utils,
 * поэтому utils собирается раньше». Топологическая сортировка даёт допустимый порядок,
 * а «волны» показывают, какие пакеты можно собирать параллельно. Обход в ширину от
 * изменённого пакета находит всё, что нужно пересобрать.
 *
 * Где пригодится: сборка и деплой, миграции БД, порядок инициализации модулей, планирование задач.
 */
import { Graph } from 'ds-kit-js';

export type Manifest = Record<string, string[]>; // пакет → его зависимости

export function dependencyGraph(manifest: Manifest): Graph<string> {
  const graph = new Graph<string>({ directed: true });
  for (const [pkg, deps] of Object.entries(manifest)) {
    graph.addVertex(pkg);
    for (const dep of deps) graph.addEdge(dep, pkg);
  }
  return graph;
}

/** Группы пакетов, которые можно собирать параллельно; группы идут строго по очереди. */
export function buildWaves(graph: Graph<string>): string[][] {
  const level = new Map<string, number>();
  for (const pkg of graph.topologicalSort()) {
    // Предшественники уже обработаны: волна пакета — на 1 больше самой поздней из зависимостей.
    const deps = graph.vertices().filter((v) => graph.hasEdge(v, pkg));
    level.set(pkg, Math.max(-1, ...deps.map((d) => level.get(d)!)) + 1);
  }
  const waves: string[][] = [];
  for (const [pkg, l] of level) (waves[l] ??= []).push(pkg);
  return waves;
}

/** Пакеты, которые нужно пересобрать после изменения `changed` (включая его самого). */
export const affectedBy = (graph: Graph<string>, changed: string): string[] => graph.bfs(changed);

// ── Демонстрация ─────────────────────────────────────────────────────────────

const monorepo: Manifest = {
  '@app/web': ['@app/ui', '@app/api-client'],
  '@app/admin': ['@app/ui', '@app/api-client'],
  '@app/api': ['@app/db', '@app/utils'],
  '@app/api-client': ['@app/utils'],
  '@app/ui': ['@app/utils'],
  '@app/db': ['@app/utils'],
  '@app/utils': [],
};

const graph = dependencyGraph(monorepo);
console.log('Порядок сборки:', graph.topologicalSort().join(' → '));
buildWaves(graph).forEach((wave, i) => console.log(`  волна ${i + 1} (параллельно): ${wave.join(', ')}`));
console.log('Изменили @app/ui → пересобрать:', affectedBy(graph, '@app/ui').join(', '));

// Циклическая зависимость — частая ошибка, которую стоит ловить в CI: utils начал импортировать web.
graph.addEdge('@app/web', '@app/utils');
try {
  graph.topologicalSort();
} catch (error) {
  console.log(`@app/utils стал зависеть от @app/web: ${(error as Error).message}`);
}
