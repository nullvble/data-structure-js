/**
 * Бронирование переговорных: сколько комнат нужно на день и как распределить по ним встречи.
 *
 * Встречи обрабатываем по времени начала. В MinHeap лежат занятые комнаты, упорядоченные
 * по времени освобождения: если самая рано освобождающаяся комната свободна к началу
 * встречи — занимаем её, иначе нужна новая комната. Итого O(n log n).
 *
 * Где пригодится: календари и бронирование, расписание смен, распределение задач по
 * серверам или исполнителям, планирование занятий.
 */
import { BinaryHeap } from 'ds-kit-js';

export interface Meeting {
  title: string;
  start: string; // "09:30"
  end: string;
}

const minutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h! * 60 + m!;
};

export function assignRooms(meetings: Meeting[]): Map<number, Meeting[]> {
  const sorted = [...meetings].sort((a, b) => minutes(a.start) - minutes(b.start));
  const busy = new BinaryHeap<{ room: number; freeAt: number }>([], (a, b) => a.freeAt - b.freeAt || a.room - b.room);
  const schedule = new Map<number, Meeting[]>();

  for (const meeting of sorted) {
    const earliest = busy.peek();
    const room = earliest && earliest.freeAt <= minutes(meeting.start) ? busy.pop()!.room : schedule.size + 1;
    busy.push({ room, freeAt: minutes(meeting.end) });
    schedule.set(room, [...(schedule.get(room) ?? []), meeting]);
  }
  return schedule;
}

// ── Демонстрация ─────────────────────────────────────────────────────────────

const day: Meeting[] = [
  { title: 'Планёрка', start: '09:00', end: '09:30' },
  { title: 'Собеседование', start: '09:15', end: '10:15' },
  { title: 'Демо клиенту', start: '10:00', end: '11:00' },
  { title: 'Ретро', start: '09:30', end: '10:30' },
  { title: '1:1 с тимлидом', start: '11:00', end: '11:30' },
  { title: 'Обед с партнёрами', start: '13:00', end: '14:00' },
  { title: 'Архитектурный ревью', start: '10:30', end: '12:00' },
];

const rooms = assignRooms(day);
console.log(`Нужно переговорных: ${rooms.size}`);
for (const [room, meetings] of rooms) {
  console.log(`  Комната ${room}: ${meetings.map((m) => `${m.start}–${m.end} ${m.title}`).join(' | ')}`);
}
