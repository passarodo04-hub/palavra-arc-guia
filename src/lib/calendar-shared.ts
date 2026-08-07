import type { PersonalEvent } from "@/lib/calendar.functions";

export const EVENT_CATEGORIES = [
  { id: "culto", label: "Culto", emoji: "⛪" },
  { id: "oracao", label: "Oração", emoji: "🙏" },
  { id: "estudo", label: "Estudo", emoji: "📖" },
  { id: "aniversario", label: "Aniversário", emoji: "🎂" },
  { id: "reuniao", label: "Reunião", emoji: "👥" },
  { id: "compromisso", label: "Compromisso", emoji: "📌" },
  { id: "devocional", label: "Devocional", emoji: "🕊️" },
  { id: "outro", label: "Outro", emoji: "✨" },
] as const;

export const RECURRENCE_LABELS: Record<PersonalEvent["recurrence"], string> = {
  none: "Não repete",
  daily: "Todos os dias",
  weekly: "Toda semana",
  monthly: "Todo mês",
  yearly: "Todo ano",
};

export const REMINDER_OPTIONS = [
  { value: null, label: "Sem lembrete" },
  { value: 5, label: "5 minutos antes" },
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 1440, label: "1 dia antes" },
] as const;

export function categoryMeta(id: string) {
  return EVENT_CATEGORIES.find((c) => c.id === id) ?? EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isoOf(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** True when a recurring event has an occurrence on the given day.
 *  Recurrence is derived at read time — never duplicated in the database. */
export function occursOn(event: PersonalEvent, dayIso: string): boolean {
  if (event.eventDate === dayIso) return true;
  if (event.recurrence === "none") return false;
  if (dayIso < event.eventDate) return false;

  const [sy, sm, sd] = event.eventDate.split("-").map(Number);
  const [dy, dm, dd] = dayIso.split("-").map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const day = Date.UTC(dy, dm - 1, dd);

  switch (event.recurrence) {
    case "daily":
      return true;
    case "weekly":
      return Math.round((day - start) / 86_400_000) % 7 === 0;
    case "monthly":
      return dd === sd;
    case "yearly":
      return dm === sm && dd === sd;
    default:
      return false;
  }
}

export function eventsForDay(events: PersonalEvent[], dayIso: string): PersonalEvent[] {
  return events
    .filter((e) => occursOn(e, dayIso))
    .sort((a, b) => (a.allDay ? -1 : 0) - (b.allDay ? -1 : 0) || (a.eventTime ?? "").localeCompare(b.eventTime ?? ""));
}

export function monthMatrix(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
export const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

export function formatDayLong(dayIso: string): string {
  const [y, m, d] = dayIso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

/* ---------- guest storage (local only, mirrors the cloud shape) ---------- */

const LOCAL_KEY = "palavra-plus:calendar-events";

export function readLocalEvents(): PersonalEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? (arr as PersonalEvent[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalEvents(events: PersonalEvent[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(events));
  } catch {}
}

export function newLocalId(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
