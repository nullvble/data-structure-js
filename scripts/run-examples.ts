// Запускает примеры из examples/: все или только те, чьё имя начинается с аргумента.
//   npm run examples
//   npm run examples -- rate-limiter
import { readdirSync } from 'node:fs';

const dir = new URL('../examples/', import.meta.url);
const filter = process.argv[2] ?? '';
const files = readdirSync(dir)
  .filter((file) => file.endsWith('.ts') && file.startsWith(filter))
  .sort();

if (files.length === 0) {
  console.error(`Нет примеров, начинающихся с «${filter}»`);
  process.exit(1);
}

for (const file of files) {
  console.log(`\n━━━ examples/${file} ━━━`);
  await import(new URL(file, dir).href);
}
