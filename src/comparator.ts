/**
 * Функция сравнения: отрицательное число, если `a < b`, `0` при равенстве,
 * положительное — если `a > b`. Совместима с `Array.prototype.sort`.
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Компаратор по умолчанию: сравнивает значения операторами `<` и `>`.
 * Подходит для чисел, строк, `bigint` и `Date`.
 */
export function defaultCompare<T>(a: T, b: T): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Возвращает компаратор, сортирующий в обратном порядке. */
export function reverseCompare<T>(compare: Comparator<T> = defaultCompare): Comparator<T> {
  return (a, b) => compare(b, a);
}
