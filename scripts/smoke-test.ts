// Проверяет, что собранный пакет корректно загружается и через import, и через require.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

type Lib = typeof import('ds-kit-js');

const esm: Lib = await import('ds-kit-js');
const cjs: Lib = createRequire(import.meta.url)('ds-kit-js');

for (const [kind, lib] of [['ESM', esm], ['CJS', cjs]] as const) {
  const queue = new lib.Queue([1, 2]);
  assert.equal(queue.dequeue(), 1, `${kind}: Queue`);
  assert.deepEqual([...new lib.RedBlackTree([3, 1, 2])], [1, 2, 3], `${kind}: RedBlackTree`);
  assert.equal(Object.keys(lib).length, Object.keys(esm).length, `${kind}: exports`);
}
console.log(`ok: ${Object.keys(esm).length} exports via ESM and CJS`);
