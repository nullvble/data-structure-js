/**
 * История изменений с отменой и повтором (Ctrl+Z / Ctrl+Shift+Z) для текстового редактора.
 *
 * Каждое действие — команда, которая умеет себя применить и отменить. Сделанные команды
 * лежат в Deque: новые добавляются в конец, а при превышении лимита истории самые старые
 * удаляются из начала — тоже за O(1). Отменённые команды попадают в Stack для повтора;
 * любое новое действие очищает его.
 *
 * Где пригодится: редакторы текста и графики, конструкторы форм, «Отменить удаление» в интерфейсе.
 */
import { Deque, Stack } from 'ds-kit-js';

export interface Command<S> {
  label: string;
  apply(state: S): S;
  revert(state: S): S;
}

export class History<S> {
  readonly #done = new Deque<Command<S>>();
  readonly #undone = new Stack<Command<S>>();
  readonly #limit: number;
  state: S;

  constructor(initial: S, limit = 100) {
    this.state = initial;
    this.#limit = limit;
  }

  execute(command: Command<S>): void {
    this.state = command.apply(this.state);
    this.#done.pushBack(command);
    if (this.#done.size > this.#limit) this.#done.popFront(); // забываем самое старое действие
    this.#undone.clear();
  }

  undo(): string | undefined {
    const command = this.#done.popBack();
    if (!command) return undefined;
    this.state = command.revert(this.state);
    this.#undone.push(command);
    return command.label;
  }

  redo(): string | undefined {
    const command = this.#undone.pop();
    if (!command) return undefined;
    this.state = command.apply(this.state);
    this.#done.pushBack(command);
    return command.label;
  }

  get canUndo(): boolean {
    return !this.#done.isEmpty();
  }

  get canRedo(): boolean {
    return !this.#undone.isEmpty();
  }
}

// ── Команды для текста ───────────────────────────────────────────────────────

const insert = (at: number, text: string): Command<string> => ({
  label: `вставка «${text}»`,
  apply: (s) => s.slice(0, at) + text + s.slice(at),
  revert: (s) => s.slice(0, at) + s.slice(at + text.length),
});

const remove = (at: number, length: number, original: string): Command<string> => ({
  label: `удаление «${original.slice(at, at + length)}»`,
  apply: (s) => s.slice(0, at) + s.slice(at + length),
  revert: (s) => s.slice(0, at) + original.slice(at, at + length) + s.slice(at),
});

// ── Демонстрация ─────────────────────────────────────────────────────────────

const editor = new History('', 3); // храним только 3 последних действия
const print = (action: string): void => console.log(`${action.padEnd(34)} → "${editor.state}"`);

editor.execute(insert(0, 'Привет'));
print('ввод');
editor.execute(insert(6, ', мир'));
print('ввод');
editor.execute(insert(11, '!'));
print('ввод');
editor.execute(remove(0, 8, editor.state));
print('удаление');

print(`Ctrl+Z (${editor.undo()})`);
print(`Ctrl+Z (${editor.undo()})`);
print(`Ctrl+Shift+Z (${editor.redo()})`);
print(`Ctrl+Z (${editor.undo()})`);
print(`Ctrl+Z (${editor.undo()})`);
console.log(`ещё отменить? ${editor.canUndo ? 'да' : 'нет — первое действие вытеснено лимитом истории'}`);
