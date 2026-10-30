/**
 * Поиск дублей клиентов в CRM: записи с общим email или телефоном относятся к одному человеку,
 * причём связь может быть транзитивной (A и B делят телефон, B и C — email ⇒ A, B, C — один клиент).
 *
 * DisjointSet (Union-Find) объединяет записи почти за O(1) на операцию, поэтому
 * даже миллионы записей обрабатываются за один проход.
 *
 * Где пригодится: дедупликация клиентов и контрагентов, антифрод (связанные аккаунты),
 * склейка устройств одного пользователя в аналитике, кластеризация.
 */
import { DisjointSet } from 'ds-kit-js';

export interface CustomerRecord {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
}

const normalizePhone = (phone: string): string => phone.replace(/\D/g, '').replace(/^8/, '7');

/** Группы записей, относящихся к одному клиенту. */
export function findDuplicates(records: CustomerRecord[]): CustomerRecord[][] {
  const groups = new DisjointSet<string>(records.map((r) => r.id));
  const ownerOf = new Map<string, string>(); // контакт → первая запись, где он встретился

  for (const record of records) {
    const contacts = [...record.emails.map((e) => `email:${e.toLowerCase()}`), ...record.phones.map((p) => `tel:${normalizePhone(p)}`)];
    for (const contact of contacts) {
      const owner = ownerOf.get(contact);
      if (owner) groups.union(owner, record.id);
      else ownerOf.set(contact, record.id);
    }
  }

  const byId = new Map(records.map((r) => [r.id, r]));
  return groups.groups().map((ids) => ids.map((id) => byId.get(id)!));
}

// ── Демонстрация ─────────────────────────────────────────────────────────────

const crm: CustomerRecord[] = [
  { id: 'C1', name: 'Иван Петров', emails: ['ivan@mail.ru'], phones: ['+7 (916) 123-45-67'] },
  { id: 'C2', name: 'И. Петров', emails: ['petrov.work@corp.ru'], phones: ['8 916 123 45 67'] },
  { id: 'C3', name: 'Ivan P.', emails: ['PETROV.WORK@corp.ru', 'ivan.p@gmail.com'], phones: [] },
  { id: 'C4', name: 'Анна Смирнова', emails: ['anna@yandex.ru'], phones: ['+7 903 555-00-11'] },
  { id: 'C5', name: 'Смирнова А.', emails: [], phones: ['79035550011'] },
  { id: 'C6', name: 'Олег Иванов', emails: ['oleg@mail.ru'], phones: [] },
];

for (const group of findDuplicates(crm)) {
  const label = group.length > 1 ? `🔗 один клиент (${group.length} записи)` : '👤 уникальный';
  console.log(`${label}: ${group.map((r) => `${r.id} ${r.name}`).join(', ')}`);
}
