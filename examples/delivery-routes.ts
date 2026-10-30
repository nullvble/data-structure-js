/**
 * Логистика: кратчайший маршрут курьера и самая дешёвая сеть связи между складами.
 *
 * - Алгоритм Дейкстры (`shortestPath`) находит маршрут с минимальным временем в пути.
 * - Минимальное остовное дерево (`minimumSpanningTree`, алгоритм Краскала) отвечает на вопрос:
 *   какие участки построить или арендовать, чтобы связать все точки при минимальной общей длине.
 *
 * Где пригодится: доставка и такси, прокладка сетей и трубопроводов, маршрутизация в играх,
 * поиск пути по карте помещения.
 */
import { Graph } from 'ds-kit-js';

// Время в пути между точками, в минутах (дороги двусторонние).
const roads: [string, string, number][] = [
  ['Склад', 'Промзона', 7],
  ['Склад', 'Вокзал', 12],
  ['Промзона', 'Центр', 15],
  ['Вокзал', 'Центр', 6],
  ['Вокзал', 'Университет', 14],
  ['Центр', 'Набережная', 5],
  ['Центр', 'Университет', 9],
  ['Набережная', 'Аэропорт', 25],
  ['Университет', 'Аэропорт', 18],
];

const city = new Graph<string>();
for (const [from, to, minutes] of roads) city.addEdge(from, to, minutes);

for (const [from, to] of [['Склад', 'Набережная'], ['Склад', 'Аэропорт']] as const) {
  const route = city.shortestPath(from, to)!;
  console.log(`${from} → ${to}: ${route.distance} мин, маршрут: ${route.path.join(' → ')}`);
}

// Пробка: участок Вокзал — Центр теперь занимает 30 минут.
city.addEdge('Вокзал', 'Центр', 30);
const detour = city.shortestPath('Склад', 'Набережная')!;
console.log(`Пробка у вокзала → ${detour.distance} мин, объезд: ${detour.path.join(' → ')}`);

// Оптоволокно между точками: длина кабеля в км пропорциональна дороге.
const network = new Graph<string>();
for (const [from, to, minutes] of roads) network.addEdge(from, to, minutes * 0.5);
const { weight, edges } = network.minimumSpanningTree();
console.log(`Сеть из ${edges.length} участков, ${weight} км кабеля вместо ${roads.reduce((s, r) => s + r[2] * 0.5, 0)} км по всем дорогам:`);
for (const [a, b, km] of edges) console.log(`  ${a} — ${b}: ${km} км`);
